-- =====================================================
-- PL/SQL ТРИГЕР - Креирање тригера за праћење просечне оцене перформера
-- =====================================================
-- Овај тригер аутоматски ажурира просечну оцену перформера на основу потпуних уговора
-- и преговарачких процеса. Тригер се активира при INSERT, UPDATE или DELETE операцијама
-- на табели "Contracts" и аутоматски прерачунава репутацију перформера.

-- Прво додајемо колону за просечну оцену у табелу Performers ако не постоји
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Performers' AND column_name = 'AverageRating'
    ) THEN
        ALTER TABLE "Performers" 
        ADD COLUMN "AverageRating" DECIMAL(3,2) DEFAULT 0.00;
    END IF;
END $$;

-- Додајемо колону за оцену у табелу Contracts ако не постоји
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Contracts' AND column_name = 'PerformanceRating'
    ) THEN
        ALTER TABLE "Contracts" 
        ADD COLUMN "PerformanceRating" DECIMAL(3,2) DEFAULT NULL;
    END IF;
END $$;

-- Додајемо колону за број завршених преговора
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Performers' AND column_name = 'CompletedNegotiations'
    ) THEN
        ALTER TABLE "Performers" 
        ADD COLUMN "CompletedNegotiations" INTEGER DEFAULT 0;
    END IF;
END $$;

-- =====================================================
-- ФУНКЦИЈА ЗА ПРЕРАЧУНАВАЊЕ ПРОСЕЧНЕ ОЦЕНЕ ПЕРФОРМЕРА
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_performer_average_rating(performer_id INTEGER)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    avg_rating DECIMAL(3,2);
    completed_count INTEGER;
    total_negotiations INTEGER;
    success_rate DECIMAL(5,4);
    weighted_score DECIMAL(5,4);
BEGIN
    -- Израчунавамо просечну оцену из потпуних уговора
    SELECT COALESCE(AVG("PerformanceRating"), 0.00)
    INTO avg_rating
    FROM "Contracts" c
    WHERE c."PerformerId" = performer_id 
      AND c."Status" = 'Completed'
      AND c."PerformanceRating" IS NOT NULL;
    
    -- Рачунамо број завршених преговора за перформера
    SELECT COUNT(*)
    INTO completed_count
    FROM "Negotiations" n
    WHERE n."PerformerId" = performer_id 
      AND n."Status" = 'Completed';
    
    -- Рачунамо укупан број преговора
    SELECT COUNT(*)
    INTO total_negotiations
    FROM "Negotiations" n
    WHERE n."PerformerId" = performer_id;
    
    -- Рачунамо стопу успешности
    IF total_negotiations > 0 THEN
        success_rate := completed_count::DECIMAL / total_negotiations::DECIMAL;
    ELSE
        success_rate := 0.00;
    END IF;
    
    -- Комбинујемо оцену перформанси са стопом успешности (70% оцена + 30% успешност)
    weighted_score := (COALESCE(avg_rating, 3.00) * 0.7) + (success_rate * 5.0 * 0.3);
    
    -- Ограничавамо на скалу од 1.00 до 5.00
    IF weighted_score > 5.00 THEN
        weighted_score := 5.00;
    ELSIF weighted_score < 1.00 THEN
        weighted_score := 1.00;
    END IF;
    
    RETURN weighted_score;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ТРИГЕР ФУНКЦИЈА ЗА АЖУРИРАЊЕ СТАТИСТИКА ПЕРФОРМЕРА
-- =====================================================
CREATE OR REPLACE FUNCTION update_performer_statistics()
RETURNS TRIGGER AS $$
DECLARE
    affected_performer_id INTEGER;
    new_avg_rating DECIMAL(3,2);
    completed_negotiations_count INTEGER;
BEGIN
    -- Одређујемо ID перформера који је погођен променом
    IF TG_OP = 'DELETE' THEN
        affected_performer_id := OLD."PerformerId";
    ELSE
        affected_performer_id := NEW."PerformerId";
    END IF;
    
    -- Ажурирамо просечну оцену
    new_avg_rating := calculate_performer_average_rating(affected_performer_id);
    
    -- Рачунамо број завршених преговора
    SELECT COUNT(*)
    INTO completed_negotiations_count
    FROM "Negotiations" n
    WHERE n."PerformerId" = affected_performer_id 
      AND n."Status" = 'Completed';
    
    -- Ажурирамо статистике перформера
    UPDATE "Performers" 
    SET 
        "AverageRating" = new_avg_rating,
        "CompletedNegotiations" = completed_negotiations_count,
        "UpdatedAt" = CURRENT_TIMESTAMP
    WHERE "PerformerId" = affected_performer_id;
    
    -- Логујемо промену (за демонстрацију рада тригера)
    RAISE NOTICE 'Ажурирана статистика за перформера %: просечна оцена = %, завршени преговори = %', 
                 affected_performer_id, new_avg_rating, completed_negotiations_count;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ТРИГЕР ЗА ТАБЕЛУ CONTRACTS
-- =====================================================
DROP TRIGGER IF EXISTS trigger_contract_performer_stats ON "Contracts";

CREATE TRIGGER trigger_contract_performer_stats
    AFTER INSERT OR UPDATE OR DELETE ON "Contracts"
    FOR EACH ROW
    WHEN (
        (TG_OP = 'INSERT' AND NEW."Status" = 'Completed') OR
        (TG_OP = 'UPDATE' AND (OLD."Status" != NEW."Status" OR OLD."PerformanceRating" IS DISTINCT FROM NEW."PerformanceRating")) OR
        (TG_OP = 'DELETE' AND OLD."Status" = 'Completed')
    )
    EXECUTE FUNCTION update_performer_statistics();

-- =====================================================
-- ТРИГЕР ЗА ТАБЕЛУ NEGOTIATIONS
-- =====================================================
DROP TRIGGER IF EXISTS trigger_negotiation_performer_stats ON "Negotiations";

CREATE TRIGGER trigger_negotiation_performer_stats
    AFTER INSERT OR UPDATE OR DELETE ON "Negotiations"
    FOR EACH ROW
    WHEN (
        (TG_OP = 'INSERT' AND NEW."Status" = 'Completed') OR
        (TG_OP = 'UPDATE' AND OLD."Status" != NEW."Status") OR
        (TG_OP = 'DELETE')
    )
    EXECUTE FUNCTION update_performer_statistics();

-- =====================================================
-- ИНИЦИЈАЛИЗАЦИЈА ПОСТОЈЕЋИХ ПОДАТАКА
-- =====================================================
-- Ажурирамо статистике за све постојеће перформере
DO $$
DECLARE
    performer_record RECORD;
BEGIN
    FOR performer_record IN 
        SELECT "PerformerId" FROM "Performers"
    LOOP
        UPDATE "Performers" 
        SET 
            "AverageRating" = calculate_performer_average_rating(performer_record."PerformerId"),
            "CompletedNegotiations" = (
                SELECT COUNT(*) 
                FROM "Negotiations" 
                WHERE "PerformerId" = performer_record."PerformerId" 
                  AND "Status" = 'Completed'
            )
        WHERE "PerformerId" = performer_record."PerformerId";
    END LOOP;
    
    RAISE NOTICE 'Иницијализоване статистике за све перформере';
END $$;

-- =====================================================
-- ТЕСТ ПОДАЦИ ЗА ДЕМОНСТРАЦИЈУ ТРИГЕРА
-- =====================================================
-- Додајемо тест податке ако не постоје

-- Додајемо тест перформере ако их нема
INSERT INTO "Performers" ("Name", "Email", "Genre", "Popularity", "TechnicalRequirements", "MinPrice", "MaxPrice", "AverageResponseTime", "Status", "UpdatedAt")
SELECT 'Марко Петровић', 'marko@example.com', 'Rock', 8, 'Стандардна звучна опрема', 1000, 5000, '2 hours', 'Active', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Performers" WHERE "Email" = 'marko@example.com');

INSERT INTO "Performers" ("Name", "Email", "Genre", "Popularity", "TechnicalRequirements", "MinPrice", "MaxPrice", "AverageResponseTime", "Status", "UpdatedAt")
SELECT 'Ана Николић', 'ana@example.com', 'Pop', 9, 'Професионална звучна опрема', 2000, 8000, '1 hour', 'Active', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Performers" WHERE "Email" = 'ana@example.com');

COMMIT;

-- =====================================================
-- ПРИМЕРИ ТЕСТИРАЊА ТРИГЕРА
-- =====================================================
-- Следећи примери демонстрирају рад тригера:

/* 
-- Тест 1: Додавање оцене за уговор
UPDATE "Contracts" 
SET "PerformanceRating" = 4.5, "Status" = 'Completed'
WHERE "PerformerId" = (SELECT "PerformerId" FROM "Performers" WHERE "Email" = 'marko@example.com' LIMIT 1);

-- Тест 2: Завршавање преговора
UPDATE "Negotiations" 
SET "Status" = 'Completed'
WHERE "PerformerId" = (SELECT "PerformerId" FROM "Performers" WHERE "Email" = 'ana@example.com' LIMIT 1);

-- Провера резултата
SELECT 
    "Name",
    "AverageRating",
    "CompletedNegotiations",
    "UpdatedAt"
FROM "Performers" 
WHERE "Email" IN ('marko@example.com', 'ana@example.com');
*/