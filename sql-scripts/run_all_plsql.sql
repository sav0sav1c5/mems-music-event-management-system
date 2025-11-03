-- ============================================================================
-- MASTER SKRIPTA - POKRETANJE SVIH PL/SQL KOMPONENTI
-- ============================================================================
-- Autor: IIS Tim
-- Datum: 13. Oktobar 2025
-- Opis: Glavna skripta koja izvršava sve komponente redosledom
-- ============================================================================

SET SERVEROUTPUT ON SIZE UNLIMITED;
SET LINESIZE 200;
SET PAGESIZE 100;
SET ECHO ON;

PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT POČETAK INSTALACIJE PL/SQL KOMPONENTI
PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT;
PROMPT Trenutno vreme: 
SELECT TO_CHAR(SYSDATE, 'DD.MM.YYYY HH24:MI:SS') AS "Vreme pokretanja" FROM DUAL;
PROMPT;

-- ============================================================================
-- KORAK 1: KREIRANJE PL/SQL FUNKCIJA
-- ============================================================================

PROMPT;
PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT KORAK 1/4: Kreiranje PL/SQL funkcija
PROMPT ═══════════════════════════════════════════════════════════════════
@@plsql_function_duration.sql

-- ============================================================================
-- KORAK 2: KREIRANJE PL/SQL TRIGERA
-- ============================================================================

PROMPT;
PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT KORAK 2/4: Kreiranje PL/SQL trigera i pomoćnih tabela
PROMPT ═══════════════════════════════════════════════════════════════════
@@plsql_triggers_workflow.sql

-- ============================================================================
-- KORAK 3: KREIRANJE INDEKSA
-- ============================================================================

PROMPT;
PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT KORAK 3/4: Kreiranje SQL indeksa za optimizaciju performansi
PROMPT ═══════════════════════════════════════════════════════════════════
@@sql_indexes_performance.sql

-- ============================================================================
-- KORAK 4: KREIRANJE KOMPLEKSNOG IZVJEŠTAJA
-- ============================================================================

PROMPT;
PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT KORAK 4/4: Kreiranje PL/SQL kompleksnog izvještaja
PROMPT ═══════════════════════════════════════════════════════════════════
@@plsql_complex_report.sql

-- ============================================================================
-- VERIFIKACIJA INSTALACIJE
-- ============================================================================

PROMPT;
PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT VERIFIKACIJA: Provera instaliranih objekata
PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT;

-- Proveri funkcije
PROMPT Funkcije:
PROMPT ─────────────────────────────────────────────────────────────────
SELECT object_name AS "Naziv funkcije", status AS "Status"
FROM user_objects
WHERE object_type = 'FUNCTION'
  AND object_name LIKE 'FN_%'
ORDER BY object_name;

PROMPT;

-- Proveri trigere
PROMPT Trigeri:
PROMPT ─────────────────────────────────────────────────────────────────
SELECT trigger_name AS "Naziv trigera", status AS "Status", triggering_event AS "Događaj"
FROM user_triggers
WHERE trigger_name LIKE 'TRG_%'
ORDER BY trigger_name;

PROMPT;

-- Proveri indekse
PROMPT Indeksi:
PROMPT ─────────────────────────────────────────────────────────────────
SELECT index_name AS "Naziv indeksa", table_name AS "Tabela", status AS "Status"
FROM user_indexes
WHERE index_name LIKE 'IDX_%'
ORDER BY table_name, index_name;

PROMPT;

-- Proveri procedure
PROMPT Procedure:
PROMPT ─────────────────────────────────────────────────────────────────
SELECT object_name AS "Naziv procedure", status AS "Status"
FROM user_objects
WHERE object_type = 'PROCEDURE'
  AND object_name LIKE 'SP_%'
ORDER BY object_name;

PROMPT;

-- Proveri tipove
PROMPT PL/SQL Tipovi:
PROMPT ─────────────────────────────────────────────────────────────────
SELECT type_name AS "Naziv tipa"
FROM user_types
WHERE type_name LIKE 'T_%'
ORDER BY type_name;

PROMPT;

-- Proveri pomoćne tabele
PROMPT Pomoćne tabele:
PROMPT ─────────────────────────────────────────────────────────────────
SELECT table_name AS "Naziv tabele"
FROM user_tables
WHERE table_name IN ('NEGOTIATIONSTATUSLOG', 'PHASESTATISTICS')
ORDER BY table_name;

PROMPT;

-- ============================================================================
-- FINALNA STATISTIKA
-- ============================================================================

PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT INSTALACIJA ZAVRŠENA USPEŠNO!
PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT;

DECLARE
    v_functions NUMBER;
    v_triggers NUMBER;
    v_procedures NUMBER;
    v_indexes NUMBER;
    v_types NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_functions FROM user_objects 
    WHERE object_type = 'FUNCTION' AND object_name LIKE 'FN_%';
    
    SELECT COUNT(*) INTO v_triggers FROM user_triggers 
    WHERE trigger_name LIKE 'TRG_%';
    
    SELECT COUNT(*) INTO v_procedures FROM user_objects 
    WHERE object_type = 'PROCEDURE' AND object_name LIKE 'SP_%';
    
    SELECT COUNT(*) INTO v_indexes FROM user_indexes 
    WHERE index_name LIKE 'IDX_%';
    
    SELECT COUNT(*) INTO v_types FROM user_types 
    WHERE type_name LIKE 'T_%';
    
    DBMS_OUTPUT.PUT_LINE('┌─────────────────────────────────────────────────────────┐');
    DBMS_OUTPUT.PUT_LINE('│              SAŽETAK INSTALACIJE                        │');
    DBMS_OUTPUT.PUT_LINE('├─────────────────────────────────────────────────────────┤');
    DBMS_OUTPUT.PUT_LINE('│  PL/SQL Funkcije:        ' || RPAD(v_functions, 5) || '                       │');
    DBMS_OUTPUT.PUT_LINE('│  PL/SQL Trigeri:         ' || RPAD(v_triggers, 5) || '                       │');
    DBMS_OUTPUT.PUT_LINE('│  PL/SQL Procedure:       ' || RPAD(v_procedures, 5) || '                       │');
    DBMS_OUTPUT.PUT_LINE('│  SQL Indeksi:            ' || RPAD(v_indexes, 5) || '                       │');
    DBMS_OUTPUT.PUT_LINE('│  PL/SQL Tipovi:          ' || RPAD(v_types, 5) || '                       │');
    DBMS_OUTPUT.PUT_LINE('│  Pomoćne tabele:         2                           │');
    DBMS_OUTPUT.PUT_LINE('└─────────────────────────────────────────────────────────┘');
    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE('✓ Svi objekti uspešno kreirani!');
END;
/

PROMPT;
PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT SLEDEĆI KORACI
PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT;
PROMPT 1. Testirajte trigere:
PROMPT    UPDATE Negotiation SET Status = 'InProgress' WHERE NegotiationId = 1;
PROMPT;
PROMPT 2. Testirajte funkcije:
PROMPT    SELECT fn_total_negotiation_duration(1) FROM DUAL;
PROMPT;
PROMPT 3. Pregledajte pomoćne tabele:
PROMPT    SELECT * FROM NegotiationStatusLog ORDER BY ChangedAt DESC;
PROMPT    SELECT * FROM PhaseStatistics ORDER BY PhaseId;
PROMPT;
PROMPT 4. Pokrenite izvještaj ponovo:
PROMPT    EXEC sp_workflow_analysis_report;
PROMPT;
PROMPT ═══════════════════════════════════════════════════════════════════

PROMPT;
SELECT TO_CHAR(SYSDATE, 'DD.MM.YYYY HH24:MI:SS') AS "Vreme završetka" FROM DUAL;
