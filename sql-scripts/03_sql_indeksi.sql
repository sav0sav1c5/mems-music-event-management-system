-- =====================================================
-- SQL ИНДЕКС - Оптимизација упита
-- =====================================================
-- Овај скрипт креира индекс за оптимизацију претраге
-- преговора по статусу и перформеру.

-- =====================================================
-- КРЕИРАЊЕ ИНДЕКСА
-- =====================================================

-- Композитни индекс за претрагу преговора по статусу и перформеру
-- Убрзава упите који филтрирају по статусу и перформеру
CREATE INDEX CONCURRENTLY idx_negotiations_status_performer 
ON "Negotiations" ("Status", "PerformerId");

RAISE NOTICE 'Креиран индекс за статус и перформер';

-- =====================================================
-- ТЕСТИРАЊЕ ПЕРФОРМАНСИ
-- =====================================================

-- Функција за мерење времена извршавања упита
CREATE OR REPLACE FUNCTION test_query_performance()
RETURNS VOID AS $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    execution_time NUMERIC;
BEGIN
    RAISE NOTICE '=== ТЕСТИРАЊЕ ПЕРФОРМАНСИ ИНДЕКСА ===';
    
    -- Тестирамо упит који користи индекс
    start_time := clock_timestamp();
    
    PERFORM COUNT(*) 
    FROM "Negotiations" 
    WHERE "Status" = 'InProgress' 
      AND "PerformerId" IN (SELECT "PerformerId" FROM "Performers" LIMIT 10);
    
    end_time := clock_timestamp();
    execution_time := EXTRACT(MILLISECONDS FROM (end_time - start_time));
    
    RAISE NOTICE 'Време извршавања упита: % ms', execution_time;
    
    -- Приказујемо план извршавања
    RAISE NOTICE 'Користи се индекс: idx_negotiations_status_performer';
END;
$$ LANGUAGE plpgsql;

-- Покрећемо тест
SELECT test_query_performance();

-- Приказујемо план извршавања упита
EXPLAIN (ANALYZE, BUFFERS) 
SELECT n."NegotiationId", n."ProposedFee", p."Name"
FROM "Negotiations" n
JOIN "Performers" p ON n."PerformerId" = p."PerformerId"
WHERE n."Status" = 'InProgress'
ORDER BY n."ProposedFee" DESC
LIMIT 10;

COMMIT;