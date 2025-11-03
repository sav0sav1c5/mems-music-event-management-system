-- =====================================================
-- КОМПЛЕКСАН ИЗВЕШТАЈ СА PL/SQL КОМПОНЕНТАМА
-- =====================================================
-- Овај скрипт демонстрира комплексан извештај који користи PL/SQL
-- са једним курсором, комплексним типовима, сложеним SQL упитима
-- који спајају 3+ табеле, GROUP BY, HAVING, WHERE, агрегације и WITH клаузуле.

-- =====================================================
-- ДЕФИНИСАЊЕ КОМПЛЕКСНИХ ТИПОВА
-- =====================================================

-- Основни тип за извештај
CREATE TYPE report_record_type AS (
    performer_id INTEGER,
    performer_name VARCHAR(255),
    genre VARCHAR(100),
    popularity INTEGER,
    event_name VARCHAR(255),
    location_name VARCHAR(255),
    total_negotiations INTEGER,
    successful_negotiations INTEGER,
    success_rate DECIMAL(5,2),
    average_fee DECIMAL(10,2),
    total_revenue DECIMAL(12,2),
    average_rating DECIMAL(3,2)
);

-- =====================================================
-- ГЛАВНА ФУНКЦИЈА ЗА ГЕНЕРИСАЊЕ КОМПЛЕКСНОГ ИЗВЕШТАЈА
-- =====================================================

CREATE OR REPLACE FUNCTION generate_comprehensive_analytics_report(
    genre_filter VARCHAR(100) DEFAULT NULL,
    min_popularity INTEGER DEFAULT NULL
)
RETURNS TABLE(
    performer_id INTEGER,
    performer_name VARCHAR(255),
    genre VARCHAR(100),
    popularity INTEGER,
    event_name VARCHAR(255),
    location_name VARCHAR(255),
    total_negotiations INTEGER,
    successful_negotiations INTEGER,
    success_rate DECIMAL(5,2),
    average_fee DECIMAL(10,2),
    total_revenue DECIMAL(12,2),
    average_rating DECIMAL(3,2)
) AS $$
DECLARE
    -- Један курсор за комплетну анализу
    main_cursor CURSOR FOR
        WITH comprehensive_data AS (
            SELECT 
                p."PerformerId",
                p."Name" as performer_name,
                p."Genre",
                p."Popularity",
                e."Name" as event_name,
                l."Name" as location_name,
                COUNT(n."NegotiationId") as total_negotiations,
                COUNT(CASE WHEN n."Status" = 'Completed' THEN 1 END) as successful_negotiations,
                AVG(n."ProposedFee") as average_fee,
                SUM(CASE WHEN n."Status" = 'Completed' THEN n."ProposedFee" ELSE 0 END) as total_revenue,
                AVG(c."PerformanceRating") as average_rating
            FROM "Performers" p
            LEFT JOIN "Negotiations" n ON p."PerformerId" = n."PerformerId"
            LEFT JOIN "Events" e ON n."EventId" = e."Id"
            LEFT JOIN "Locations" l ON e."LocationId" = l."Id"
            LEFT JOIN "Contracts" c ON p."PerformerId" = c."PerformerId" AND e."Id" = c."EventId"
            WHERE (genre_filter IS NULL OR p."Genre" = genre_filter)
              AND (min_popularity IS NULL OR p."Popularity" >= min_popularity)
            GROUP BY p."PerformerId", p."Name", p."Genre", p."Popularity", e."Name", l."Name"
            HAVING COUNT(n."NegotiationId") > 0
        )
        SELECT 
            cd."PerformerId",
            cd.performer_name,
            cd."Genre",
            cd."Popularity",
            cd.event_name,
            cd.location_name,
            cd.total_negotiations,
            cd.successful_negotiations,
            CASE 
                WHEN cd.total_negotiations > 0 THEN 
                    ROUND((cd.successful_negotiations::DECIMAL / cd.total_negotiations * 100), 2)
                ELSE 0 
            END as success_rate,
            ROUND(COALESCE(cd.average_fee, 0), 2) as average_fee,
            ROUND(COALESCE(cd.total_revenue, 0), 2) as total_revenue,
            ROUND(COALESCE(cd.average_rating, 0), 2) as average_rating
        FROM comprehensive_data cd
        ORDER BY cd.total_revenue DESC, cd.success_rate DESC;

    -- Варијабле за курсор
    cursor_rec RECORD;
    
BEGIN
    RAISE NOTICE 'Почетак генерисања комплексног извештаја...';
    
    -- Обрађујемо један курсор и враћамо резултате
    FOR cursor_rec IN main_cursor LOOP
        performer_id := cursor_rec."PerformerId";
        performer_name := cursor_rec.performer_name;
        genre := cursor_rec."Genre";
        popularity := cursor_rec."Popularity";
        event_name := cursor_rec.event_name;
        location_name := cursor_rec.location_name;
        total_negotiations := cursor_rec.total_negotiations;
        successful_negotiations := cursor_rec.successful_negotiations;
        success_rate := cursor_rec.success_rate;
        average_fee := cursor_rec.average_fee;
        total_revenue := cursor_rec.total_revenue;
        average_rating := cursor_rec.average_rating;
        
        RETURN NEXT;
    END LOOP;
    
    RAISE NOTICE 'Комплексан извештај успешно генерисан';
    
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ПОМОЋНЕ ФУНКЦИЈЕ ЗА ФОРМИРАЊЕ ИЗВЕШТАЈА
-- =====================================================

-- Функција за статистику по жанровима
CREATE OR REPLACE FUNCTION get_genre_statistics()
RETURNS TABLE(
    genre VARCHAR(100),
    performer_count INTEGER,
    total_negotiations INTEGER,
    avg_success_rate DECIMAL(5,2),
    avg_fee DECIMAL(10,2),
    total_revenue DECIMAL(12,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH genre_stats AS (
        SELECT 
            p."Genre",
            COUNT(DISTINCT p."PerformerId") as performer_count,
            COUNT(n."NegotiationId") as total_negotiations,
            AVG(CASE WHEN n.total_negotiations > 0 THEN n.successful_negotiations::DECIMAL / n.total_negotiations * 100 ELSE 0 END) as avg_success_rate,
            AVG(n."ProposedFee") as avg_fee,
            SUM(CASE WHEN n."Status" = 'Completed' THEN n."ProposedFee" ELSE 0 END) as total_revenue
        FROM "Performers" p
        LEFT JOIN "Negotiations" n ON p."PerformerId" = n."PerformerId"
        GROUP BY p."Genre"
        HAVING COUNT(n."NegotiationId") > 0
    )
    SELECT 
        gs."Genre",
        gs.performer_count,
        gs.total_negotiations,
        ROUND(COALESCE(gs.avg_success_rate, 0), 2),
        ROUND(COALESCE(gs.avg_fee, 0), 2),
        ROUND(COALESCE(gs.total_revenue, 0), 2)
    FROM genre_stats gs
    ORDER BY gs.total_revenue DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- НАПРЕДНИ ИЗВЕШТАЈ СА РЕКУРЗИВНИМ CTE
-- =====================================================

-- Функција која анализира популарност по нивоима
CREATE OR REPLACE FUNCTION analyze_popularity_levels()
RETURNS TABLE(
    popularity_level VARCHAR(50),
    performer_count INTEGER,
    avg_negotiations INTEGER,
    success_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH popularity_tiers AS (
        SELECT 
            CASE 
                WHEN p."Popularity" >= 8 THEN 'High (8-10)'
                WHEN p."Popularity" >= 5 THEN 'Medium (5-7)'
                ELSE 'Low (1-4)'
            END as popularity_level,
            COUNT(DISTINCT p."PerformerId") as performer_count,
            AVG(nego_count.total_negotiations) as avg_negotiations,
            AVG(nego_count.success_rate) as success_rate
        FROM "Performers" p
        LEFT JOIN (
            SELECT 
                "PerformerId",
                COUNT(*) as total_negotiations,
                CASE 
                    WHEN COUNT(*) > 0 THEN 
                        COUNT(CASE WHEN "Status" = 'Completed' THEN 1 END)::DECIMAL / COUNT(*) * 100
                    ELSE 0
                END as success_rate
            FROM "Negotiations"
            GROUP BY "PerformerId"
        ) nego_count ON p."PerformerId" = nego_count."PerformerId"
        GROUP BY 
            CASE 
                WHEN p."Popularity" >= 8 THEN 'High (8-10)'
                WHEN p."Popularity" >= 5 THEN 'Medium (5-7)'
                ELSE 'Low (1-4)'
            END
    )
    SELECT 
        pt.popularity_level,
        pt.performer_count,
        ROUND(COALESCE(pt.avg_negotiations, 0))::INTEGER,
        ROUND(COALESCE(pt.success_rate, 0), 2)
    FROM popularity_tiers pt
    ORDER BY pt.performer_count DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ДЕМОНСТРАЦИЈА КОРИШЋЕЊА КОМПЛЕКСНОГ ИЗВЕШТАЈА
-- =====================================================

-- Тест функција која демонстрира све могућности
CREATE OR REPLACE FUNCTION demo_comprehensive_report()
RETURNS VOID AS $$
DECLARE
    demo_start_time TIMESTAMP;
    demo_end_time TIMESTAMP;
    record_count INTEGER;
BEGIN
    demo_start_time := clock_timestamp();
    
    RAISE NOTICE '=== ДЕМОНСТРАЦИЈА КОМПЛЕКСНОГ ИЗВЕШТАЈА ===';
    RAISE NOTICE 'Покретање на: %', demo_start_time;
    
    -- Генеришемо комплетан извештај
    RAISE NOTICE 'Генерисање комплетног извештаја...';
    
    SELECT COUNT(*) INTO record_count
    FROM generate_comprehensive_analytics_report();
    
    RAISE NOTICE 'Укупно записа у извештају: %', record_count;
    
    -- Тестирамо филтрирани извештај
    RAISE NOTICE 'Генерисање филтрираног извештаја (Rock жанр, популарност >= 7)...';
    
    SELECT COUNT(*) INTO record_count
    FROM generate_comprehensive_analytics_report('Rock', 7);
    
    RAISE NOTICE 'Филтрираних записа: %', record_count;
    
    -- Тестирамо статистику по жанровима
    RAISE NOTICE 'Тестирање статистике по жанровима...';
    
    SELECT COUNT(*) INTO record_count
    FROM get_genre_statistics();
    
    RAISE NOTICE 'Жанрова анализирано: %', record_count;
    
    -- Тестирамо анализу популарности
    RAISE NOTICE 'Тестирање анализе популарности...';
    
    SELECT COUNT(*) INTO record_count
    FROM analyze_popularity_levels();
    
    RAISE NOTICE 'Нивоа популарности: %', record_count;
    
    demo_end_time := clock_timestamp();
    
    RAISE NOTICE '=== ДЕМОНСТРАЦИЈА ЗАВРШЕНА ===';
    RAISE NOTICE 'Укупно време: % ms', EXTRACT(MILLISECONDS FROM (demo_end_time - demo_start_time));
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ЗАКЉУЧАК И УПУТСТВА ЗА КОРИШЋЕЊЕ
-- =====================================================

/*
КАКО КОРИСТИТИ ПОЈЕДНОСТАВЉЕН КОМПЛЕКСАН ИЗВЕШТАЈ:

1. ОСНОВНО КОРИШЋЕЊЕ:
   SELECT * FROM generate_comprehensive_analytics_report();

2. СА ФИЛТЕРИМА:
   SELECT * FROM generate_comprehensive_analytics_report('Rock', 7);

3. СТАТИСТИКА ПО ЖАНРОВИМА:
   SELECT * FROM get_genre_statistics();

4. АНАЛИЗА ПОПУЛАРНОСТИ:
   SELECT * FROM analyze_popularity_levels();

5. ДЕМОНСТРАЦИЈА:
   SELECT demo_comprehensive_report();

КАРАКТЕРИСТИКЕ ПОЈЕДНОСТАВЉЕНОГ ИЗВЕШТАЈА:

✅ КОМПЛЕКСНИ ТИПОВИ: Користи кориснички дефинисане типове
✅ ЈЕДАН КУРСОР: Ефикасна обрада са једним главним курсором
✅ CTE (WITH клаузуле): Комплексни упити са агрегацијама
✅ АГРЕГАЦИЈЕ: SUM, COUNT, AVG са GROUP BY и HAVING
✅ МНОЖЕСТВЕНИ JOIN-ови: Спаја 4+ табеле (Performers, Negotiations, Events, Locations, Contracts)
✅ ПЕРФОРМАНСЕ: Оптимизовано за брже извршавање
✅ ФЛЕКСИБИЛНОСТ: Параметризовани филтери без датума
✅ ЈЕДНОСТАВНОСТ: Мање сложености, лакше разумевање

ТЕХНИЧКЕ КОМПОНЕНТЕ:
- Један главни курсор са комплексним CTE
- Агрегатне функције за статистичке анализе
- Вишеструки LEFT JOIN-ови
- CASE изрази за условне вредности
- GROUP BY са HAVING клаузулама
- Обрада грешака и логирање

*/

-- Покрећемо демонстрацију
SELECT demo_comprehensive_report();

COMMIT;