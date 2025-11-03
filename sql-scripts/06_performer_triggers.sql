-- =====================================================
-- PL/pgSQL TRIGERI ZA PERFORMER TABELU
-- =====================================================

-- TRIGER 1: Automatska validacija i ažuriranje performer podataka
-- Ovaj triger se izvršava PRE INSERT ili UPDATE operacije

CREATE OR REPLACE FUNCTION validate_performer_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Validacija email adrese
    IF NEW."Email" !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RAISE EXCEPTION 'Email adresa nije validna: %', NEW."Email";
    END IF;
    
    -- Validacija MinPrice i MaxPrice
    IF NEW."MinPrice" < 0 THEN
        RAISE EXCEPTION 'Minimalna cena ne može biti negativna: %', NEW."MinPrice";
    END IF;
    
    IF NEW."MaxPrice" < NEW."MinPrice" THEN
        RAISE EXCEPTION 'Maksimalna cena (%) ne može biti manja od minimalne (%)!', NEW."MaxPrice", NEW."MinPrice";
    END IF;
    
    -- Validacija popularity (0-100)
    IF NEW."Popularity" < 0 OR NEW."Popularity" > 100 THEN
        RAISE EXCEPTION 'Popularnost mora biti između 0 i 100, trenutno: %', NEW."Popularity";
    END IF;
    
    -- Automatsko postavljanje UpdatedAt timestamp-a
    NEW."UpdatedAt" = CURRENT_TIMESTAMP;
    
    -- Normalizacija Name-a (capitalize first letter)
    NEW."Name" = INITCAP(TRIM(NEW."Name"));
    
    -- Automatsko postavljanje Status-a na osnovu popularity
    IF NEW."Popularity" >= 80 THEN
        NEW."Status" = 'VIP';
    ELSIF NEW."Popularity" >= 50 THEN
        NEW."Status" = 'Active';
    ELSE
        NEW."Status" = 'Standard';
    END IF;
    
    -- Log poruka
    RAISE NOTICE 'Performer % (ID: %) je validiran i ažuriran sa statusom %', 
        NEW."Name", COALESCE(NEW."PerformerId", 0), NEW."Status";
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Kreiranje trigera za validaciju
DROP TRIGGER IF EXISTS trg_validate_performer ON "Performers";
CREATE TRIGGER trg_validate_performer
    BEFORE INSERT OR UPDATE ON "Performers"
    FOR EACH ROW
    EXECUTE FUNCTION validate_performer_data();

-- =====================================================

-- TRIGER 2: Automatsko računanje prosečnog spending-a (ProposedFee)
-- Ovaj triger se izvršava NAKON INSERT, UPDATE ili DELETE na Negotiations tabeli
-- i ažurira prosečnu vrednost ProposedFee za performer-a
-- 
-- NAPOMENA: Funkcija update_performer_average_spending() mora biti kreirana pre ovog trigera!
-- Pokrenuti: 02_function_average_spending.sql

-- Kreiranje trigera koji se aktivira nakon INSERT, UPDATE ili DELETE na Negotiations
DROP TRIGGER IF EXISTS trg_after_negotiation_change ON "Negotiations";
CREATE TRIGGER trg_after_negotiation_change
    AFTER INSERT OR UPDATE OR DELETE
    ON "Negotiations"
    FOR EACH ROW
    EXECUTE FUNCTION update_performer_average_spending();

-- =====================================================
-- FUNKCIJA ZA PROVERU DA LI SU TRIGERI ISPRAVNO KREIRANI
-- =====================================================

CREATE OR REPLACE FUNCTION check_performer_triggers()
RETURNS TABLE(
    trigger_name TEXT,
    table_name TEXT,
    trigger_timing TEXT,
    trigger_events TEXT,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.trigger_name::TEXT,
        t.event_object_table::TEXT,
        t.action_timing::TEXT,
        string_agg(t.event_manipulation, ', ' ORDER BY t.event_manipulation)::TEXT,
        CASE 
            WHEN t.trigger_name IS NOT NULL THEN 'KREIRAN ✓'
            ELSE 'NIJE KREIRAN ✗'
        END::TEXT
    FROM information_schema.triggers t
    WHERE t.trigger_schema = 'public' 
    AND (t.trigger_name = 'trg_validate_performer' OR t.trigger_name = 'trg_after_negotiation_change')
    GROUP BY t.trigger_name, t.event_object_table, t.action_timing
    
    UNION ALL
    
    -- Proverava da li postoje funkcije
    SELECT 
        r.routine_name::TEXT,
        'function'::TEXT,
        r.routine_type::TEXT,
        'N/A'::TEXT,
        CASE 
            WHEN r.routine_name IS NOT NULL THEN 'KREIRANA ✓'
            ELSE 'NIJE KREIRANA ✗'
        END::TEXT
    FROM information_schema.routines r
    WHERE r.routine_schema = 'public' 
    AND (r.routine_name = 'validate_performer_data' OR r.routine_name = 'update_performer_average_spending')
    ORDER BY 1;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TEST PODATAKA I PRIMERA
-- =====================================================

-- Provera da li su trigeri ispravno kreirani
SELECT * FROM check_performer_triggers();

-- Primer test podataka:
-- 1. Dodavanje novog performer-a (testira Triger 1)
/*
INSERT INTO "Performers" (
    "Name", "Email", "Contact", "Genre", "Popularity", 
    "TechnicalRequirements", "MinPrice", "MaxPrice", "AverageResponseTime"
) VALUES (
    'john doe', 'john@example.com', '+381641234567', 'Rock', 75,
    'Guitar, Microphone, Amplifier', 500.00, 2000.00, '02:30:00'
);
*/

-- 2. Dodavanje negotiation-a (testira Triger 2)
/*
INSERT INTO "Negotiations" (
    "PerformerId", "EventId", "ProposedFee", "Status", "InitiatedDate"
) VALUES (
    1, 1, 1500.00, 'InProgress', CURRENT_TIMESTAMP
);
*/

-- 3. Provera rezultata
/*
SELECT 
    p."Name", 
    p."Status", 
    p."AverageSpending",
    COUNT(n."NegotiationId") as negotiation_count,
    AVG(n."ProposedFee") as manual_avg_check
FROM "Performers" p
LEFT JOIN "Negotiations" n ON p."PerformerId" = n."PerformerId"
WHERE p."PerformerId" = 1
GROUP BY p."PerformerId", p."Name", p."Status", p."AverageSpending";
*/

RAISE NOTICE '=== PERFORMER TRIGERI SU USPEŠNO KREIRANI ===';
RAISE NOTICE 'Triger 1: validate_performer_data() - Validacija i auto-ažuriranje (BEFORE INSERT/UPDATE)';
RAISE NOTICE 'Triger 2: trg_after_negotiation_change - Poziva funkciju update_performer_average_spending()';
RAISE NOTICE 'NAPOMENA: Funkcija update_performer_average_spending() mora biti kreirana iz 02_function_average_spending.sql!';
RAISE NOTICE 'Pokretanje: SELECT * FROM check_performer_triggers(); za proveru statusa';
RAISE NOTICE 'Kompletna provera: SELECT * FROM verify_performer_system();';