-- =====================================================
-- PL/pgSQL FUNKCIJA ZA RAČUNANJE PROSEČNOG SPENDING-A
-- =====================================================
-- Fajl: 02_function_average_spending.sql
-- Datum: 20. oktobar 2025
-- Svrha: Funkcija za automatsko računanje prosečnog ProposedFee za performer-a

-- Kreiranje funkcije za računanje prosečnog spending-a
CREATE OR REPLACE FUNCTION update_performer_average_spending()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    affected_performer_id INTEGER;
    new_average NUMERIC(10,2);
BEGIN
    -- Određuje koji PerformerId je pogođen
    IF TG_OP = 'DELETE' THEN
        affected_performer_id := OLD."PerformerId";
    ELSE
        affected_performer_id := NEW."PerformerId";
    END IF;

    -- Računanje novog proseka ProposedFee za pogođenog performer-a
    SELECT COALESCE(AVG("ProposedFee"::NUMERIC), 0.00)
    INTO new_average
    FROM "Negotiations"
    WHERE "PerformerId" = affected_performer_id
    AND "ProposedFee" IS NOT NULL;

    -- Ažuriranje prosečne vrednosti u Performers tabeli
    -- Dodaćemo kolonu AverageSpending ako ne postoji
    BEGIN
        ALTER TABLE "Performers" ADD COLUMN IF NOT EXISTS "AverageSpending" NUMERIC(10,2) DEFAULT 0.00;
    EXCEPTION
        WHEN duplicate_column THEN
            -- Kolona već postoji, nastavi
            NULL;
    END;

    UPDATE "Performers"
    SET "AverageSpending" = new_average
    WHERE "PerformerId" = affected_performer_id;

    -- Log poruka za debugging
    RAISE NOTICE 'Ažuriran PerformerId % prosečan spending na %', affected_performer_id, new_average;

    -- Vraća odgovarajući record na osnovu operacije
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- =====================================================
-- FUNKCIJA ZA TESTIRANJE
-- =====================================================

-- Funkcija za manuelno ažuriranje proseka za određenog performer-a
CREATE OR REPLACE FUNCTION manual_update_performer_spending(performer_id_param INTEGER)
RETURNS NUMERIC(10,2)
LANGUAGE plpgsql
AS $$
DECLARE
    calculated_average NUMERIC(10,2);
BEGIN
    -- Računanje proseka
    SELECT COALESCE(AVG("ProposedFee"::NUMERIC), 0.00)
    INTO calculated_average
    FROM "Negotiations"
    WHERE "PerformerId" = performer_id_param
    AND "ProposedFee" IS NOT NULL;

    -- Ažuriranje
    UPDATE "Performers"
    SET "AverageSpending" = calculated_average
    WHERE "PerformerId" = performer_id_param;

    RAISE NOTICE 'Manuelno ažuriran PerformerId % sa prosekom %', performer_id_param, calculated_average;
    
    RETURN calculated_average;
END;
$$;

-- =====================================================
-- FUNKCIJA ZA BULK AŽURIRANJE SVIH PERFORMER-A
-- =====================================================

CREATE OR REPLACE FUNCTION update_all_performers_spending()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    performer_record RECORD;
    updated_count INTEGER := 0;
    calculated_average NUMERIC(10,2);
BEGIN
    -- Dodaj kolonu ako ne postoji
    BEGIN
        ALTER TABLE "Performers" ADD COLUMN IF NOT EXISTS "AverageSpending" NUMERIC(10,2) DEFAULT 0.00;
    EXCEPTION
        WHEN duplicate_column THEN
            NULL;
    END;

    -- Iteracija kroz sve performer-e
    FOR performer_record IN 
        SELECT "PerformerId" FROM "Performers"
    LOOP
        -- Računanje proseka za trenutnog performer-a
        SELECT COALESCE(AVG("ProposedFee"::NUMERIC), 0.00)
        INTO calculated_average
        FROM "Negotiations"
        WHERE "PerformerId" = performer_record."PerformerId"
        AND "ProposedFee" IS NOT NULL;

        -- Ažuriranje
        UPDATE "Performers"
        SET "AverageSpending" = calculated_average
        WHERE "PerformerId" = performer_record."PerformerId";

        updated_count := updated_count + 1;
    END LOOP;

    RAISE NOTICE 'Ažurirano % performer-a sa prosečnim spending-om', updated_count;
    
    RETURN updated_count;
END;
$$;

-- =====================================================
-- FUNKCIJA ZA PROVERU KONZISTENTNOSTI
-- =====================================================

CREATE OR REPLACE FUNCTION check_spending_consistency()
RETURNS TABLE(
    performer_id INTEGER,
    performer_name VARCHAR(255),
    stored_average NUMERIC(10,2),
    calculated_average NUMERIC(10,2),
    difference NUMERIC(10,2),
    is_consistent BOOLEAN
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p."PerformerId",
        p."Name",
        COALESCE(p."AverageSpending", 0.00) as stored_avg,
        COALESCE(AVG(n."ProposedFee"::NUMERIC), 0.00) as calc_avg,
        ABS(COALESCE(p."AverageSpending", 0.00) - COALESCE(AVG(n."ProposedFee"::NUMERIC), 0.00)) as diff,
        (ABS(COALESCE(p."AverageSpending", 0.00) - COALESCE(AVG(n."ProposedFee"::NUMERIC), 0.00)) < 0.01) as consistent
    FROM "Performers" p
    LEFT JOIN "Negotiations" n ON p."PerformerId" = n."PerformerId" AND n."ProposedFee" IS NOT NULL
    GROUP BY p."PerformerId", p."Name", p."AverageSpending"
    ORDER BY p."PerformerId";
END;
$$;

RAISE NOTICE '=== FUNKCIJE ZA AVERAGE SPENDING SU USPEŠNO KREIRANE ===';
RAISE NOTICE 'Glavna funkcija: update_performer_average_spending() - za trigere';
RAISE NOTICE 'Pomoćne funkcije:';
RAISE NOTICE '  - manual_update_performer_spending(performer_id) - manuelno ažuriranje';
RAISE NOTICE '  - update_all_performers_spending() - bulk ažuriranje svih';
RAISE NOTICE '  - check_spending_consistency() - provera konzistentnosti';