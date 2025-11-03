-- =====================================================
-- ГЛАВНА ФУНКЦИЈА ЗА ИЗРАЧУНАВАЊЕ СЛОЖЕНОСТИ ПРЕГОВОРА
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_negotiation_complexity(negotiation_id INTEGER)
RETURNS TABLE (
    complexity_score DECIMAL(5,2),
    complexity_level VARCHAR(20),
    phase_count INTEGER,
    contract_value DECIMAL(10,2)
) AS $$
DECLARE
    phase_cnt INTEGER := 0;
    contract_val DECIMAL(10,2) := 0;
    total_score DECIMAL(5,2) := 0;
    level_name VARCHAR(20) := 'Unknown';
BEGIN
    -- Проверавамо да ли преговор постоји
    IF NOT EXISTS (SELECT 1 FROM "Negotiations" WHERE "NegotiationId" = negotiation_id) THEN
        RAISE EXCEPTION 'Преговор са ID % не постоји', negotiation_id;
    END IF;
    
    -- Рачунамо број фаза и вредност
    SELECT n."CurrentPhaseOrder", n."ProposedFee"
    INTO phase_cnt, contract_val
    FROM "Negotiations" n
    WHERE n."NegotiationId" = negotiation_id;
    
    -- Рачунамо скор на основу фаза (0-50 поена)
    total_score := LEAST(phase_cnt * 10.0, 50.0);
    
    -- Додајемо скор на основу вредности (0-50 поена)
    CASE 
        WHEN contract_val < 1000 THEN total_score := total_score + 5.0;
        WHEN contract_val < 5000 THEN total_score := total_score + 15.0;
        WHEN contract_val < 10000 THEN total_score := total_score + 25.0;
        WHEN contract_val < 25000 THEN total_score := total_score + 35.0;
        ELSE total_score := total_score + 50.0;
    END CASE;
    
    -- Одређујемо ниво сложености
    CASE 
        WHEN total_score < 20 THEN level_name := 'Једноставан';
        WHEN total_score < 40 THEN level_name := 'Умерен';
        WHEN total_score < 60 THEN level_name := 'Сложен';
        WHEN total_score < 80 THEN level_name := 'Веома сложен';
        ELSE level_name := 'Критичан';
    END CASE;
    
    -- Враћамо резултате
    complexity_score := total_score;
    complexity_level := level_name;
    phase_count := phase_cnt;
    contract_value := contract_val;
    
    RETURN NEXT;
    duration_score DECIMAL(5,2) := 0;
    value_score DECIMAL(5,2) := 0;
    total_score DECIMAL(5,2) := 0;
    level_name VARCHAR(20);
    
    -- Променљиве за рачунавање
    phase_cnt INTEGER;
    req_cnt INTEGER;
    neg_duration INTEGER;
    contract_val DECIMAL(10,2);
    
    -- Детаљи за извештај
    detail_info JSONB;
BEGIN
    -- Рачунамо број фаза у преговору
    SELECT COUNT(*)
    INTO phase_cnt
    FROM "NegotiationPhases" np
    WHERE np."NegotiationId" = negotiation_id;
    
    -- Рачунамо укупан број захтева у свим фазама
    SELECT COUNT(DISTINCT nrf."RequirementId")
    INTO req_cnt
    FROM "NegotiationRequirementFulfillments" nrf
    WHERE nrf."NegotiationId" = negotiation_id;
    
    -- Рачунамо трајање преговора у данима
    SELECT EXTRACT(DAY FROM (n."EndDate" - n."StartDate"))
    INTO neg_duration
    FROM "Negotiations" n
    WHERE n."NegotiationId" = negotiation_id;
    
    -- Добијамо вредност уговора
    SELECT n."ProposedFee"
    INTO contract_val
    FROM "Negotiations" n
    WHERE n."NegotiationId" = negotiation_id;
    
    -- СКОРИНГ СИСТЕМ:
    
    -- 1. Скор на основу броја фаза (0-25 поена)
    phase_score := LEAST(phase_cnt * 4.0, 25.0);
    
    -- 2. Скор на основу броја захтева (0-30 поена)
    requirement_score := LEAST(req_cnt * 2.0, 30.0);
    
    -- 3. Скор на основу трајања преговора (0-25 поена)
    CASE 
        WHEN neg_duration <= 7 THEN duration_score := 5.0;
        WHEN neg_duration <= 30 THEN duration_score := 10.0;
        WHEN neg_duration <= 60 THEN duration_score := 15.0;
        WHEN neg_duration <= 120 THEN duration_score := 20.0;
        ELSE duration_score := 25.0;
    END CASE;
    
    -- 4. Скор на основу вредности уговора (0-20 поена)
    CASE 
        WHEN contract_val < 1000 THEN value_score := 2.0;
        WHEN contract_val < 5000 THEN value_score := 5.0;
        WHEN contract_val < 10000 THEN value_score := 8.0;
        WHEN contract_val < 25000 THEN value_score := 12.0;
        WHEN contract_val < 50000 THEN value_score := 16.0;
        ELSE value_score := 20.0;
    END CASE;
    
    -- Рачунамо укупан скор
    total_score := phase_score + requirement_score + duration_score + value_score;
    
    -- Одређујемо ниво сложености
    CASE 
        WHEN total_score < 20 THEN level_name := 'Једноставан';
        WHEN total_score < 40 THEN level_name := 'Умерен';
        WHEN total_score < 60 THEN level_name := 'Сложен';
        WHEN total_score < 80 THEN level_name := 'Веома сложен';
        ELSE level_name := 'Критичан';
    END CASE;
    
    -- Припремамо детаљне информације
    detail_info := jsonb_build_object(
        'phase_score', phase_score,
        'requirement_score', requirement_score,
        'duration_score', duration_score,
        'value_score', value_score,
        'scoring_breakdown', jsonb_build_object(
            'phases', jsonb_build_object('count', phase_cnt, 'score', phase_score),
            'requirements', jsonb_build_object('count', req_cnt, 'score', requirement_score),
            'duration', jsonb_build_object('days', neg_duration, 'score', duration_score),
            'value', jsonb_build_object('amount', contract_val, 'score', value_score)
        )
    );
    
    -- Враћамо резултате
    complexity_score := total_score;
    complexity_level := level_name;
    
    RETURN NEXT;
    
    RAISE NOTICE 'Израчуната сложеност за преговор %: % (% поена)', 
        negotiation_id, level_name, total_score;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ДЕМОНСТРАЦИЈА КОРИШЋЕЊА ФУНКЦИЈЕ
-- =====================================================

-- Тест функција која приказује коришћење
CREATE OR REPLACE FUNCTION demo_complexity_calculation()
RETURNS VOID AS $$
DECLARE 
    test_rec RECORD;
    demo_count INTEGER := 0;
BEGIN
    RAISE NOTICE '=== ДЕМОНСТРАЦИЈА ИЗРАЧУНАВАЊА СЛОЖЕНОСТИ ===';
    
    -- Тестирамо функцију на неколико преговора
    FOR test_rec IN 
        SELECT "NegotiationId" FROM "Negotiations" LIMIT 5
    LOOP
        demo_count := demo_count + 1;
        RAISE NOTICE 'Тест %:', demo_count;
        
        PERFORM * FROM calculate_negotiation_complexity(test_rec."NegotiationId");
    END LOOP;
    
    RAISE NOTICE 'Демонстрација завршена.';
END;
$$ LANGUAGE plpgsql;

-- Покрећемо демонстрацију
SELECT demo_complexity_calculation();

-- Пример коришћења функције
SELECT 
    n."NegotiationId",
    n."Status", 
    c.*
FROM "Negotiations" n
CROSS JOIN LATERAL calculate_negotiation_complexity(n."NegotiationId") c
LIMIT 10;

COMMIT;