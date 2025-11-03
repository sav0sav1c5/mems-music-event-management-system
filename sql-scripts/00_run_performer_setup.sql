-- =====================================================
-- MASTER SKRIPTA ZA POKRETANJE SVIH PERFORMER TRIGERA
-- =====================================================
-- Fajl: 00_run_performer_setup.sql
-- Datum: 20. oktobar 2025
-- Svrha: Pokreće sve skripte u pravilnom redosledu

-- REDOSLED IZVRŠAVANJA:
-- 1. Funkcije za average spending
-- 2. Trigeri za performer tabelu
-- 3. Provera da li je sve uspešno kreirano

RAISE NOTICE '=== POČETAK INSTALACIJE PERFORMER TRIGERA ===';
RAISE NOTICE 'Datum: %', CURRENT_DATE;
RAISE NOTICE 'Vreme: %', CURRENT_TIME;

-- =====================================================
-- KORAK 1: Kreiranje funkcija za average spending
-- =====================================================

RAISE NOTICE 'KORAK 1: Kreiranje funkcija za average spending...';

-- Uključivanje funkcija iz 02_function_average_spending.sql
-- NAPOMENA: U pgAdmin, ovo morate pokrenuti manuelno ili koristiti \i komandu u psql

-- Ako koristite psql command line:
-- \i '02_function_average_spending.sql'

-- Ako koristite pgAdmin, kopirajte i nalepite sadržaj iz 02_function_average_spending.sql ovde
-- ili pokrenite fajlove redom

-- =====================================================
-- KORAK 2: Kreiranje trigera
-- =====================================================

RAISE NOTICE 'KORAK 2: Kreiranje trigera...';

-- Uključivanje trigera iz 06_performer_triggers.sql
-- NAPOMENA: U pgAdmin, ovo morate pokrenuti manuelno ili koristiti \i komandu u psql

-- Ako koristite psql command line:
-- \i '06_performer_triggers.sql'

-- =====================================================
-- KORAK 3: Finalna provera
-- =====================================================

RAISE NOTICE 'KORAK 3: Provera instalacije...';

-- Funkcija za kompletnu proveru sistema
CREATE OR REPLACE FUNCTION verify_performer_system()
RETURNS TABLE(
    component_type TEXT,
    component_name TEXT,
    status TEXT,
    details TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    -- Provera funkcija
    SELECT 
        'FUNCTION'::TEXT,
        r.routine_name::TEXT,
        CASE WHEN r.routine_name IS NOT NULL THEN 'KREIRANA ✓' ELSE 'NEDOSTAJE ✗' END::TEXT,
        CONCAT('Schema: ', r.routine_schema, ', Type: ', r.routine_type)::TEXT
    FROM information_schema.routines r
    WHERE r.routine_schema = 'public' 
    AND r.routine_name IN ('validate_performer_data', 'update_performer_average_spending', 
                          'manual_update_performer_spending', 'update_all_performers_spending',
                          'check_spending_consistency')
    
    UNION ALL
    
    -- Provera trigera
    SELECT 
        'TRIGGER'::TEXT,
        t.trigger_name::TEXT,
        CASE WHEN t.trigger_name IS NOT NULL THEN 'KREIRAN ✓' ELSE 'NEDOSTAJE ✗' END::TEXT,
        CONCAT('Table: ', t.event_object_table, ', Events: ', 
               string_agg(t.event_manipulation, ', '), ', Timing: ', t.action_timing)::TEXT
    FROM information_schema.triggers t
    WHERE t.trigger_schema = 'public' 
    AND t.trigger_name IN ('trg_validate_performer', 'trg_after_negotiation_change')
    GROUP BY t.trigger_name, t.event_object_table, t.action_timing
    
    UNION ALL
    
    -- Provera kolone AverageSpending
    SELECT 
        'COLUMN'::TEXT,
        'AverageSpending'::TEXT,
        CASE WHEN c.column_name IS NOT NULL THEN 'POSTOJI ✓' ELSE 'NEDOSTAJE ⚠️' END::TEXT,
        CONCAT('Table: ', c.table_name, ', Type: ', c.data_type)::TEXT
    FROM information_schema.columns c
    WHERE c.table_schema = 'public' 
    AND c.table_name = 'Performers'
    AND c.column_name = 'AverageSpending'
    
    ORDER BY 1, 2;
END;
$$;

-- =====================================================
-- INSTRUKCIJE ZA POKRETANJE
-- =====================================================

RAISE NOTICE '';
RAISE NOTICE '=== INSTRUKCIJE ZA POTPUNU INSTALACIJU ===';
RAISE NOTICE '';
RAISE NOTICE 'U pgAdmin, pokrenite fajlove REDOM:';
RAISE NOTICE '1. 02_function_average_spending.sql  (funkcije)';
RAISE NOTICE '2. 06_performer_triggers.sql         (trigeri)';
RAISE NOTICE '3. SELECT * FROM verify_performer_system(); (provera)';
RAISE NOTICE '';
RAISE NOTICE 'U psql command line:';
RAISE NOTICE '\i ''02_function_average_spending.sql''';
RAISE NOTICE '\i ''06_performer_triggers.sql''';
RAISE NOTICE 'SELECT * FROM verify_performer_system();';
RAISE NOTICE '';
RAISE NOTICE '=== ZAVRŠETAK MASTER SKRIPTE ===';

-- Test da li funkcija verify postoji
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.routines 
               WHERE routine_schema = 'public' 
               AND routine_name = 'verify_performer_system') THEN
        RAISE NOTICE 'Funkcija verify_performer_system() je kreirana uspešno!';
        RAISE NOTICE 'Pokrenite: SELECT * FROM verify_performer_system();';
    END IF;
END
$$;