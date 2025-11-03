-- ============================================================================
-- SQL INDEKSI - DEMONSTRACIJA PERFORMANSI ZA NEGOTIATIONS TABELU
-- ============================================================================
-- Datum: 20. oktobar 2025
-- Svrha: Demonstrirati poboljšanje performansi upita sa indeksima na Status i PerformerId

-- ============================================================================
-- KREIRANJE KOMPOZITNOG TIPA I TABELE ZA ČUVANJE REZULTATA
-- ============================================================================

-- Brisanje postojećih objekata
DROP TABLE IF EXISTS performance_log;
DROP TYPE IF EXISTS performance_record CASCADE;

-- Brisanje postojećih indeksa (ako postoje)
DROP INDEX IF EXISTS idx_negotiations_status;
DROP INDEX IF EXISTS idx_negotiations_performer_id;
DROP INDEX IF EXISTS idx_negotiations_proposed_fee;

-- Kreiranje kompozitnog tipa za čuvanje rezultata performansi
CREATE TYPE performance_record AS (
    test_broj INTEGER,
    test_naziv VARCHAR(200),
    faza VARCHAR(20),
    vreme_izvrsavanja_ms NUMERIC(10,3),
    timestamp_merenja TIMESTAMP
);

-- Kreiranje tabele za logovanje performansi
CREATE TABLE performance_log (
    id SERIAL PRIMARY KEY,
    test_broj INTEGER,
    test_naziv VARCHAR(200),
    faza VARCHAR(20),
    vreme_izvrsavanja_ms NUMERIC(10,3),
    timestamp_merenja TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT 'Kompozitni tip i tabela za performanse kreirani!' AS status;

-- ============================================================================
-- PERFORMANSE PRE KREIRANJA INDEKSA
-- ============================================================================
SELECT '=== FAZA 1: PERFORMANSE PRE INDEKSA ===' AS faza;

-- Test Upit 1: Složen upit sa JOIN-om i filtriranjem (PRE INDEKSA)
DO $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    execution_time NUMERIC(10,3);
BEGIN
    start_time := clock_timestamp();
    
    PERFORM n."NegotiationId", n."Status", n."ProposedFee", p."Name"
    FROM "Negotiations" n
    JOIN "Performers" p ON n."PerformerId" = p."PerformerId"
    WHERE n."Status" = 'InProgress'
      AND n."ProposedFee" > 1000;
    
    end_time := clock_timestamp();
    execution_time := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    
    INSERT INTO performance_log (test_broj, test_naziv, faza, vreme_izvrsavanja_ms)
    VALUES (1, 'JOIN upit sa statusom i performer-om', 'PRE', execution_time);
    
    RAISE NOTICE 'Test 1 PRE: Vreme izvršavanja = % ms', execution_time;
END $$;
    -------------------------------------------------------------------
DO $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    execution_time NUMERIC(10,3);
BEGIN
    start_time := clock_timestamp();
    
    PERFORM COUNT(*), AVG("ProposedFee"), MIN("ProposedFee"), MAX("ProposedFee")
    FROM "Negotiations" 
    WHERE "ProposedFee" BETWEEN 1000 AND 3000;
    
    end_time := clock_timestamp();
    execution_time := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    
    INSERT INTO performance_log (test_broj, test_naziv, faza, vreme_izvrsavanja_ms)
    VALUES (2, 'Range upit na ProposedFee', 'PRE', execution_time);
    
    RAISE NOTICE 'Test 3 PRE: Vreme izvršavanja = % ms', execution_time;
END $$;

-- KREIRANJE INDEKSA
SELECT '=== FAZA 2: KREIRANJE INDEKSA ===' AS faza;

-- Kreiranje indeksa na Status koloni
CREATE INDEX idx_negotiations_status 
ON "Negotiations" ("Status");

-- Kreiranje indeksa na PerformerId koloni
CREATE INDEX idx_negotiations_performer_id 
ON "Negotiations" ("PerformerId");

-- Kreiranje indeksa na ProposedFee za range upite
CREATE INDEX idx_negotiations_proposed_fee 
ON "Negotiations" ("ProposedFee");


-- Verifikacija da su indeksi kreirani
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'Negotiations' 
  AND indexname LIKE 'idx_negotiations%';

SELECT 'Indeksi na Negotiations tabeli su uspešno kreirani!' AS message;

SELECT '=== FAZA 2: PERFORMANSE POSLE INDEKSA ===' AS faza;

-- Test Upit 1: Isti složen upit sa JOIN-om (POSLE indeksa)
DO $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    execution_time NUMERIC(10,3);
BEGIN
    start_time := clock_timestamp();
    
    PERFORM n."NegotiationId", n."Status", n."ProposedFee", p."Name"
    FROM "Negotiations" n
    JOIN "Performers" p ON n."PerformerId" = p."PerformerId"
    WHERE n."Status" = 'InProgress'
      AND n."ProposedFee" > 1000;
    
    end_time := clock_timestamp();
    execution_time := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    
    INSERT INTO performance_log (test_broj, test_naziv, faza, vreme_izvrsavanja_ms)
    VALUES (1, 'JOIN upit sa statusom i performer-om', 'POSLE', execution_time);
    
    RAISE NOTICE 'Test 1 POSLE: Vreme izvršavanja = % ms', execution_time;
END $$;

DO $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    execution_time NUMERIC(10,3);
BEGIN
    start_time := clock_timestamp();
    
    PERFORM COUNT(*), AVG("ProposedFee"), MIN("ProposedFee"), MAX("ProposedFee")
    FROM "Negotiations" 
    WHERE "ProposedFee" BETWEEN 1000 AND 3000;
    
    end_time := clock_timestamp();
    execution_time := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    
    INSERT INTO performance_log (test_broj, test_naziv, faza, vreme_izvrsavanja_ms)
    VALUES (2, 'Range upit na ProposedFee', 'POSLE', execution_time);
    
    RAISE NOTICE 'Test 2 POSLE: Vreme izvršavanja = % ms', execution_time;
END $$;