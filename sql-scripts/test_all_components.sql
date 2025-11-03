-- ============================================================================
-- TESTNI PRIMERI I DEMONSTRACIJA
-- ============================================================================
-- Autor: IIS Tim
-- Datum: 13. Oktobar 2025
-- Opis: Praktični primeri za testiranje svih komponenti
-- ============================================================================

SET SERVEROUTPUT ON SIZE UNLIMITED;
SET LINESIZE 200;

PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT TESTNI SCENARIJI - DEMONSTRACIJA PL/SQL KOMPONENTI
PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT;

-- ============================================================================
-- TEST 1: TESTIRANJE TRIGERA
-- ============================================================================

PROMPT ╔══════════════════════════════════════════════════════════════╗
PROMPT ║  TEST 1: Trigeri za Logovanje i Statistiku                  ║
PROMPT ╚══════════════════════════════════════════════════════════════╝
PROMPT;

-- Scenario 1: Promena statusa pregovora (aktivira Triger 1)
PROMPT Scenario 1: Menjam status prvog pregovora...;
DECLARE
    v_nego_id NUMBER;
BEGIN
    -- Uzmi prvi pregovor
    SELECT MIN(NegotiationId) INTO v_nego_id FROM Negotiation;
    
    IF v_nego_id IS NOT NULL THEN
        DBMS_OUTPUT.PUT_LINE('Pregovor ID: ' || v_nego_id);
        DBMS_OUTPUT.PUT_LINE('Akcija: UPDATE Status na InProgress');
        
        UPDATE Negotiation 
        SET Status = 'InProgress' 
        WHERE NegotiationId = v_nego_id;
        
        COMMIT;
        
        DBMS_OUTPUT.PUT_LINE('✓ Status uspešno promenjen!');
        DBMS_OUTPUT.PUT_LINE('');
        
        -- Prikaži log
        DBMS_OUTPUT.PUT_LINE('Log zapisi za ovaj pregovor:');
        FOR log_rec IN (
            SELECT OldStatus, NewStatus, Duration, ChangedAt
            FROM NegotiationStatusLog
            WHERE NegotiationId = v_nego_id
            ORDER BY ChangedAt DESC
            FETCH FIRST 3 ROWS ONLY
        ) LOOP
            DBMS_OUTPUT.PUT_LINE('  ' || log_rec.OldStatus || ' → ' || 
                                log_rec.NewStatus || ' (Trajanje: ' || 
                                log_rec.Duration || ' dana)');
        END LOOP;
    ELSE
        DBMS_OUTPUT.PUT_LINE('⚠ Nema pregovora u bazi za testiranje.');
    END IF;
END;
/

PROMPT;
PROMPT ───────────────────────────────────────────────────────────────────;
PROMPT;

-- Scenario 2: Završavanje faze (aktivira Trigere 2 i 3)
PROMPT Scenario 2: Označavam fazu kao završenu...;
DECLARE
    v_nego_id NUMBER;
    v_phase_id NUMBER;
BEGIN
    -- Pronađi prvu aktivnu fazu
    SELECT np.NegotiationId, np.PhaseId 
    INTO v_nego_id, v_phase_id
    FROM NegotiationPhase np
    WHERE np.Status != 'Completed'
      AND np.StartDate IS NOT NULL
      AND ROWNUM = 1;
    
    DBMS_OUTPUT.PUT_LINE('Pregovor ID: ' || v_nego_id || ', Faza ID: ' || v_phase_id);
    DBMS_OUTPUT.PUT_LINE('Akcija: Označavanje faze kao završene');
    
    UPDATE NegotiationPhase
    SET Status = 'Completed',
        CompletedDate = SYSTIMESTAMP
    WHERE NegotiationId = v_nego_id
      AND PhaseId = v_phase_id;
    
    COMMIT;
    
    DBMS_OUTPUT.PUT_LINE('✓ Faza označena kao završena!');
    DBMS_OUTPUT.PUT_LINE('');
    
    -- Prikaži ažuriranu statistiku
    DBMS_OUTPUT.PUT_LINE('Ažurirana statistika za fazu:');
    FOR stat_rec IN (
        SELECT PhaseName, TotalNegotiations, CompletedNegotiations, AverageDuration
        FROM PhaseStatistics
        WHERE PhaseId = v_phase_id
    ) LOOP
        DBMS_OUTPUT.PUT_LINE('  Faza: ' || stat_rec.PhaseName);
        DBMS_OUTPUT.PUT_LINE('  Ukupno: ' || stat_rec.TotalNegotiations);
        DBMS_OUTPUT.PUT_LINE('  Završeno: ' || stat_rec.CompletedNegotiations);
        DBMS_OUTPUT.PUT_LINE('  Prosečno trajanje: ' || stat_rec.AverageDuration || ' dana');
    END LOOP;
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('⚠ Nema faza u statusu za testiranje.');
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Greška: ' || SQLERRM);
END;
/

PROMPT;

-- ============================================================================
-- TEST 2: TESTIRANJE FUNKCIJA
-- ============================================================================

PROMPT;
PROMPT ╔══════════════════════════════════════════════════════════════╗
PROMPT ║  TEST 2: PL/SQL Funkcije                                    ║
PROMPT ╚══════════════════════════════════════════════════════════════╝
PROMPT;

-- Test funkcije za trajanje
PROMPT Test 2.1: fn_total_negotiation_duration
PROMPT ───────────────────────────────────────────────────────────────────;

SELECT 
    n.NegotiationId,
    p.Name AS Izvođač,
    n.Status,
    fn_total_negotiation_duration(n.NegotiationId) AS TrajanjeUDanima,
    CASE 
        WHEN fn_total_negotiation_duration(n.NegotiationId) < 30 THEN '⚡ BRZO'
        WHEN fn_total_negotiation_duration(n.NegotiationId) < 60 THEN '⏱ SREDNJE'
        ELSE '🐢 SPORO'
    END AS Ocena
FROM Negotiation n
JOIN Performer p ON n.PerformerId = p.PerformerId
WHERE ROWNUM <= 5
ORDER BY fn_total_negotiation_duration(n.NegotiationId) DESC;

PROMPT;
PROMPT Test 2.2: fn_validate_negotiation_status
PROMPT ───────────────────────────────────────────────────────────────────;

DECLARE
    v_nego_id NUMBER;
    v_result VARCHAR2(200);
BEGIN
    SELECT MIN(NegotiationId) INTO v_nego_id FROM Negotiation;
    
    IF v_nego_id IS NOT NULL THEN
        -- Test validacije različitih prelaza
        v_result := fn_validate_negotiation_status(v_nego_id, 'Completed');
        DBMS_OUTPUT.PUT_LINE('Prelazak na Completed: ' || v_result);
        
        v_result := fn_validate_negotiation_status(v_nego_id, 'InProgress');
        DBMS_OUTPUT.PUT_LINE('Prelazak na InProgress: ' || v_result);
        
        v_result := fn_validate_negotiation_status(v_nego_id, 'OnHold');
        DBMS_OUTPUT.PUT_LINE('Prelazak na OnHold: ' || v_result);
    END IF;
END;
/

PROMPT;

-- ============================================================================
-- TEST 3: TESTIRANJE INDEKSA
-- ============================================================================

PROMPT;
PROMPT ╔══════════════════════════════════════════════════════════════╗
PROMPT ║  TEST 3: SQL Indeksi i Performanse                          ║
PROMPT ╚══════════════════════════════════════════════════════════════╝
PROMPT;

-- Prikaži informacije o indeksima
PROMPT Kreirani indeksi:
PROMPT ───────────────────────────────────────────────────────────────────;

SELECT 
    index_name AS "Naziv",
    table_name AS "Tabela",
    status AS "Status",
    num_rows AS "Redova"
FROM user_indexes
WHERE index_name LIKE 'IDX_%'
ORDER BY table_name, index_name;

PROMPT;

-- Test upit koji koristi indekse
PROMPT Test upit (koristi indekse):
PROMPT ───────────────────────────────────────────────────────────────────;

SELECT 
    n.NegotiationId,
    n.Status,
    p.Name AS Izvođač,
    COUNT(nrf.FulfillmentId) AS BrojZahteva
FROM Negotiation n
JOIN Performer p ON n.PerformerId = p.PerformerId
JOIN NegotiationPhase np ON n.NegotiationId = np.NegotiationId
LEFT JOIN NegotiationRequirementFulfillment nrf 
    ON n.NegotiationId = nrf.NegotiationId
WHERE n.Status = 'InProgress'  -- Koristi idx_negotiation_status_active
  AND np.IsActive = 1           -- Koristi idx_negotiation_phase_active
GROUP BY n.NegotiationId, n.Status, p.Name
HAVING COUNT(nrf.FulfillmentId) > 0
ORDER BY n.NegotiationId
FETCH FIRST 5 ROWS ONLY;

PROMPT;

-- ============================================================================
-- TEST 4: KOMPLEKSAN IZVJEŠTAJ
-- ============================================================================

PROMPT;
PROMPT ╔══════════════════════════════════════════════════════════════╗
PROMPT ║  TEST 4: Kompleksan PL/SQL Izvještaj                        ║
PROMPT ╚══════════════════════════════════════════════════════════════╝
PROMPT;
PROMPT Pokrećem sp_workflow_analysis_report...;
PROMPT;

-- Pokreni glavni izvještaj
EXEC sp_workflow_analysis_report;

PROMPT;

-- ============================================================================
-- TEST 5: PREGLED POMOĆNIH TABELA
-- ============================================================================

PROMPT;
PROMPT ╔══════════════════════════════════════════════════════════════╗
PROMPT ║  TEST 5: Pomoćne Tabele sa Podacima                         ║
PROMPT ╚══════════════════════════════════════════════════════════════╝
PROMPT;

-- NegotiationStatusLog
PROMPT Tabela: NegotiationStatusLog (poslednjih 10 zapisa)
PROMPT ───────────────────────────────────────────────────────────────────;

SELECT 
    LogId,
    NegotiationId,
    OldStatus || ' → ' || NewStatus AS Promena,
    Duration || ' dana' AS Trajanje,
    TO_CHAR(ChangedAt, 'DD.MM.YYYY HH24:MI') AS Vreme
FROM NegotiationStatusLog
ORDER BY ChangedAt DESC
FETCH FIRST 10 ROWS ONLY;

PROMPT;

-- PhaseStatistics
PROMPT Tabela: PhaseStatistics
PROMPT ───────────────────────────────────────────────────────────────────;

SELECT 
    PhaseId,
    RPAD(PhaseName, 30) AS Faza,
    TotalNegotiations AS Ukupno,
    CompletedNegotiations AS Završeno,
    ROUND(AverageDuration, 1) AS "Pros. Trajanje",
    TO_CHAR(LastUpdated, 'DD.MM HH24:MI') AS Ažurirano
FROM PhaseStatistics
ORDER BY PhaseId;

PROMPT;

-- ============================================================================
-- TEST 6: AGREGATNI UPITI SA FUNKCIJAMA
-- ============================================================================

PROMPT;
PROMPT ╔══════════════════════════════════════════════════════════════╗
PROMPT ║  TEST 6: Agregatni Upiti (GROUP BY, HAVING, funkcije)       ║
PROMPT ╚══════════════════════════════════════════════════════════════╝
PROMPT;

-- Agregacija po statusu
PROMPT Test 6.1: Prosečno trajanje po statusu pregovora
PROMPT ───────────────────────────────────────────────────────────────────;

SELECT 
    Status,
    COUNT(*) AS BrojPregovora,
    ROUND(AVG(fn_total_negotiation_duration(NegotiationId)), 1) AS ProsecnoTrajanje,
    MIN(fn_total_negotiation_duration(NegotiationId)) AS MinTrajanje,
    MAX(fn_total_negotiation_duration(NegotiationId)) AS MaxTrajanje
FROM Negotiation
GROUP BY Status
HAVING COUNT(*) > 0
ORDER BY ProsecnoTrajanje DESC;

PROMPT;

-- Agregacija sa JOIN-om
PROMPT Test 6.2: Statistika izvođača sa trajanjem pregovora
PROMPT ───────────────────────────────────────────────────────────────────;

SELECT 
    p.Name AS Izvođač,
    p.Genre AS Žanr,
    COUNT(n.NegotiationId) AS BrojPregovora,
    ROUND(AVG(fn_total_negotiation_duration(n.NegotiationId)), 1) AS ProsecnoTrajanje,
    SUM(CASE WHEN n.Status = 'Completed' THEN 1 ELSE 0 END) AS Završeno,
    ROUND(
        SUM(CASE WHEN n.Status = 'Completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(n.NegotiationId),
        2
    ) AS StopaUspešnosti
FROM Performer p
LEFT JOIN Negotiation n ON p.PerformerId = n.PerformerId
GROUP BY p.PerformerId, p.Name, p.Genre
HAVING COUNT(n.NegotiationId) > 0
ORDER BY BrojPregovora DESC
FETCH FIRST 10 ROWS ONLY;

PROMPT;

-- ============================================================================
-- TEST 7: WITH KLAUZULA (CTE)
-- ============================================================================

PROMPT;
PROMPT ╔══════════════════════════════════════════════════════════════╗
PROMPT ║  TEST 7: WITH Klauzula (Common Table Expression)            ║
PROMPT ╚══════════════════════════════════════════════════════════════╝
PROMPT;

WITH 
-- CTE 1: Osnovne metrike pregovora
NegotiationMetrics AS (
    SELECT 
        n.NegotiationId,
        n.Status,
        fn_total_negotiation_duration(n.NegotiationId) AS Duration,
        COUNT(np.PhaseId) AS PhaseCount
    FROM Negotiation n
    LEFT JOIN NegotiationPhase np ON n.NegotiationId = np.NegotiationId
    GROUP BY n.NegotiationId, n.Status
),
-- CTE 2: Klasifikacija po trajanju
DurationClassification AS (
    SELECT 
        NegotiationId,
        Status,
        Duration,
        PhaseCount,
        CASE 
            WHEN Duration < 30 THEN 'BRZO (< 30 dana)'
            WHEN Duration < 60 THEN 'SREDNJE (30-60 dana)'
            ELSE 'SPORO (> 60 dana)'
        END AS Kategorija
    FROM NegotiationMetrics
)
-- Glavni upit: Agregacija po kategorijama
SELECT 
    Kategorija,
    COUNT(*) AS BrojPregovora,
    ROUND(AVG(Duration), 1) AS ProsecnoTrajanje,
    ROUND(AVG(PhaseCount), 1) AS ProsečnoBrojFaza
FROM DurationClassification
GROUP BY Kategorija
ORDER BY 
    CASE Kategorija
        WHEN 'BRZO (< 30 dana)' THEN 1
        WHEN 'SREDNJE (30-60 dana)' THEN 2
        ELSE 3
    END;

PROMPT;

-- ============================================================================
-- SAŽETAK TESTIRANJA
-- ============================================================================

PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT SAŽETAK TESTIRANJA
PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT;

DECLARE
    v_triggers NUMBER;
    v_functions NUMBER;
    v_procedures NUMBER;
    v_indexes NUMBER;
    v_types NUMBER;
    v_log_records NUMBER;
    v_stats_records NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_triggers FROM user_triggers WHERE trigger_name LIKE 'TRG_%';
    SELECT COUNT(*) INTO v_functions FROM user_objects WHERE object_type = 'FUNCTION' AND object_name LIKE 'FN_%';
    SELECT COUNT(*) INTO v_procedures FROM user_objects WHERE object_type = 'PROCEDURE' AND object_name LIKE 'SP_%';
    SELECT COUNT(*) INTO v_indexes FROM user_indexes WHERE index_name LIKE 'IDX_%';
    SELECT COUNT(*) INTO v_types FROM user_types WHERE type_name LIKE 'T_%';
    SELECT COUNT(*) INTO v_log_records FROM NegotiationStatusLog;
    SELECT COUNT(*) INTO v_stats_records FROM PhaseStatistics;
    
    DBMS_OUTPUT.PUT_LINE('┌────────────────────────────────────────────────────────┐');
    DBMS_OUTPUT.PUT_LINE('│  KOMPONENTA                      BROJ       STATUS     │');
    DBMS_OUTPUT.PUT_LINE('├────────────────────────────────────────────────────────┤');
    DBMS_OUTPUT.PUT_LINE('│  PL/SQL Trigeri                  ' || RPAD(v_triggers, 4) || '       ' || 
                        CASE WHEN v_triggers >= 3 THEN '✓ OK' ELSE '✗ GREŠKA' END || '      │');
    DBMS_OUTPUT.PUT_LINE('│  PL/SQL Funkcije                 ' || RPAD(v_functions, 4) || '       ' || 
                        CASE WHEN v_functions >= 2 THEN '✓ OK' ELSE '✗ GREŠKA' END || '      │');
    DBMS_OUTPUT.PUT_LINE('│  PL/SQL Procedure                ' || RPAD(v_procedures, 4) || '       ' || 
                        CASE WHEN v_procedures >= 1 THEN '✓ OK' ELSE '✗ GREŠKA' END || '      │');
    DBMS_OUTPUT.PUT_LINE('│  SQL Indeksi                     ' || RPAD(v_indexes, 4) || '       ' || 
                        CASE WHEN v_indexes >= 4 THEN '✓ OK' ELSE '✗ GREŠKA' END || '      │');
    DBMS_OUTPUT.PUT_LINE('│  PL/SQL Tipovi                   ' || RPAD(v_types, 4) || '       ' || 
                        CASE WHEN v_types >= 4 THEN '✓ OK' ELSE '✗ GREŠKA' END || '      │');
    DBMS_OUTPUT.PUT_LINE('├────────────────────────────────────────────────────────┤');
    DBMS_OUTPUT.PUT_LINE('│  Zapisi u NegotiationStatusLog   ' || RPAD(v_log_records, 10) || '           │');
    DBMS_OUTPUT.PUT_LINE('│  Zapisi u PhaseStatistics        ' || RPAD(v_stats_records, 10) || '           │');
    DBMS_OUTPUT.PUT_LINE('└────────────────────────────────────────────────────────┘');
    DBMS_OUTPUT.PUT_LINE('');
    
    IF v_triggers >= 3 AND v_functions >= 2 AND v_procedures >= 1 AND 
       v_indexes >= 4 AND v_types >= 4 THEN
        DBMS_OUTPUT.PUT_LINE('✓ SVE KOMPONENTE USPEŠNO INSTALIRANE I TESTIRANE!');
    ELSE
        DBMS_OUTPUT.PUT_LINE('⚠ UPOZORENJE: Neke komponente nedostaju.');
    END IF;
END;
/

PROMPT;
PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT TESTIRANJE ZAVRŠENO
PROMPT ═══════════════════════════════════════════════════════════════════
