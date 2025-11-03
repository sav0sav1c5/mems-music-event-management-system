-- ============================================================================
-- PL/SQL FUNKCIJA ZA VALIDACIJU I KALKULACIJU TRAJANJA PREGOVORA
-- ============================================================================
-- Autor: IIS Tim
-- Datum: 13. Oktobar 2025
-- Opis: Funkcija koja računa ukupno trajanje pregovora u fazama
-- ============================================================================

-- ============================================================================
-- FUNKCIJA: Izračunaj ukupno trajanje pregovora kroz faze
-- ============================================================================
-- Parametri:
--   p_negotiation_id - ID pregovora za koji se računa trajanje
--
-- Vraća:
--   NUMBER - Ukupno trajanje u danima kroz sve faze
--
-- Logika:
--   - Prolazi kroz sve faze pregovora
--   - Sabira trajanje svake faze (od StartDate do CompletedDate ili SYSDATE)
--   - Vraća ukupan broj dana
--
-- Primer korišćenja:
--   SELECT fn_total_negotiation_duration(1) FROM DUAL;
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_total_negotiation_duration(
    p_negotiation_id IN NUMBER
) RETURN NUMBER
IS
    v_total_days NUMBER := 0;
    v_phase_days NUMBER := 0;
    v_negotiation_exists NUMBER;
    
    -- Kursor za prolazak kroz sve faze pregovora
    CURSOR cur_phases IS
        SELECT 
            np.PhaseId,
            np.Status,
            np.StartDate,
            np.CompletedDate,
            p.PhaseName
        FROM NegotiationPhase np
        JOIN Phase p ON np.PhaseId = p.PhaseId
        WHERE np.NegotiationId = p_negotiation_id
        ORDER BY p.OrderNumber;
        
BEGIN
    -- Proveri da li pregovor postoji
    SELECT COUNT(*) INTO v_negotiation_exists
    FROM Negotiation
    WHERE NegotiationId = p_negotiation_id;
    
    IF v_negotiation_exists = 0 THEN
        RETURN 0; -- Pregovor ne postoji
    END IF;
    
    -- Prolazi kroz sve faze i sabira trajanje
    FOR phase_rec IN cur_phases LOOP
        IF phase_rec.StartDate IS NOT NULL THEN
            IF phase_rec.Status = 'Completed' AND phase_rec.CompletedDate IS NOT NULL THEN
                -- Faza je završena - uzmi stvarno trajanje
                v_phase_days := EXTRACT(DAY FROM (phase_rec.CompletedDate - phase_rec.StartDate));
            ELSIF phase_rec.Status = 'InProgress' THEN
                -- Faza je u toku - računaj do danas
                v_phase_days := EXTRACT(DAY FROM (SYSTIMESTAMP - phase_rec.StartDate));
            ELSE
                -- Faza nije počela ili je u drugom stanju
                v_phase_days := 0;
            END IF;
            
            v_total_days := v_total_days + v_phase_days;
        END IF;
    END LOOP;
    
    RETURN ROUND(v_total_days, 1);
    
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Greška u fn_total_negotiation_duration: ' || SQLERRM);
        RETURN 0;
END fn_total_negotiation_duration;
/

-- ============================================================================
-- FUNKCIJA: Proveri validnost statusa pregovora
-- ============================================================================
-- Parametri:
--   p_negotiation_id - ID pregovora
--   p_new_status - Novi status koji se pokušava postaviti
--
-- Vraća:
--   VARCHAR2 - 'VALID' ako je promena dozvoljena, inače razlog greške
--
-- Pravila:
--   - Pending → InProgress (OK)
--   - InProgress → Completed (OK ako su sve faze završene)
--   - Completed → bilo šta (NIJE OK - završen pregovor se ne može menjati)
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_validate_negotiation_status(
    p_negotiation_id IN NUMBER,
    p_new_status IN VARCHAR2
) RETURN VARCHAR2
IS
    v_current_status VARCHAR2(50);
    v_incomplete_phases NUMBER;
    v_total_phases NUMBER;
BEGIN
    -- Dohvati trenutni status
    SELECT Status INTO v_current_status
    FROM Negotiation
    WHERE NegotiationId = p_negotiation_id;
    
    -- Pravilo 1: Završen pregovor se ne može menjati
    IF v_current_status = 'Completed' THEN
        RETURN 'GREŠKA: Završen pregovor se ne može menjati.';
    END IF;
    
    -- Pravilo 2: Prelazak u "Completed" samo ako su sve faze završene
    IF p_new_status = 'Completed' THEN
        SELECT 
            COUNT(*),
            SUM(CASE WHEN Status != 'Completed' THEN 1 ELSE 0 END)
        INTO v_total_phases, v_incomplete_phases
        FROM NegotiationPhase
        WHERE NegotiationId = p_negotiation_id;
        
        IF v_incomplete_phases > 0 THEN
            RETURN 'GREŠKA: Pregovor ne može biti završen dok su ' || 
                   v_incomplete_phases || ' faza/e još u toku.';
        END IF;
    END IF;
    
    -- Pravilo 3: Validni prelazi
    IF (v_current_status = 'Pending' AND p_new_status = 'InProgress') OR
       (v_current_status = 'InProgress' AND p_new_status = 'Completed') OR
       (v_current_status = 'InProgress' AND p_new_status = 'OnHold') THEN
        RETURN 'VALID';
    END IF;
    
    -- Sve ostale promene
    RETURN 'UPOZORENJE: Neobičan prelaz statusa: ' || v_current_status || ' → ' || p_new_status;
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN 'GREŠKA: Pregovor sa ID=' || p_negotiation_id || ' ne postoji.';
    WHEN OTHERS THEN
        RETURN 'GREŠKA: ' || SQLERRM;
END fn_validate_negotiation_status;
/

-- ============================================================================
-- DEMONSTRACIJA KORIŠĆENJA FUNKCIJA U SQL UPITIMA
-- ============================================================================

SET SERVEROUTPUT ON SIZE UNLIMITED;

PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT DEMONSTRACIJA: Korišćenje PL/SQL funkcija u SQL upitima
PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT;

-- ============================================================================
-- Upit 1: Prikaži trajanje svih pregovora
-- ============================================================================
PROMPT Upit 1: Trajanje svih pregovora (koristi fn_total_negotiation_duration)
PROMPT ───────────────────────────────────────────────────────────────────

SELECT 
    n.NegotiationId,
    p.Name AS Performer,
    e.Name AS Event,
    n.Status,
    fn_total_negotiation_duration(n.NegotiationId) AS TrajanjeDana,
    CASE 
        WHEN fn_total_negotiation_duration(n.NegotiationId) <= 30 THEN 'BRZO'
        WHEN fn_total_negotiation_duration(n.NegotiationId) <= 60 THEN 'SREDNJE'
        ELSE 'SPORO'
    END AS Klasifikacija
FROM Negotiation n
JOIN Performer p ON n.PerformerId = p.PerformerId
JOIN Event e ON n.EventId = e.Id
WHERE ROWNUM <= 10
ORDER BY fn_total_negotiation_duration(n.NegotiationId) DESC;

PROMPT;

-- ============================================================================
-- Upit 2: Prosečno trajanje po statusu pregovora
-- ============================================================================
PROMPT Upit 2: Prosečno trajanje pregovora po statusu
PROMPT ───────────────────────────────────────────────────────────────────

SELECT 
    n.Status,
    COUNT(*) AS BrojPregovora,
    ROUND(AVG(fn_total_negotiation_duration(n.NegotiationId)), 1) AS ProsecnoTrajanje,
    MIN(fn_total_negotiation_duration(n.NegotiationId)) AS MinTrajanje,
    MAX(fn_total_negotiation_duration(n.NegotiationId)) AS MaxTrajanje
FROM Negotiation n
GROUP BY n.Status
ORDER BY ProsecnoTrajanje DESC;

PROMPT;

-- ============================================================================
-- Upit 3: Validacija statusa pre promene (demonstracija)
-- ============================================================================
PROMPT Upit 3: Testiranje validacije statusa
PROMPT ───────────────────────────────────────────────────────────────────

-- Primer validacije
DECLARE
    v_result VARCHAR2(200);
    v_negotiation_id NUMBER;
BEGIN
    -- Uzmi prvi pregovor
    SELECT MIN(NegotiationId) INTO v_negotiation_id FROM Negotiation;
    
    IF v_negotiation_id IS NOT NULL THEN
        -- Test 1: Pokušaj prelaska na Completed
        v_result := fn_validate_negotiation_status(v_negotiation_id, 'Completed');
        DBMS_OUTPUT.PUT_LINE('Test 1 - Prelazak na Completed: ' || v_result);
        
        -- Test 2: Pokušaj prelaska na InProgress
        v_result := fn_validate_negotiation_status(v_negotiation_id, 'InProgress');
        DBMS_OUTPUT.PUT_LINE('Test 2 - Prelazak na InProgress: ' || v_result);
    ELSE
        DBMS_OUTPUT.PUT_LINE('Nema pregovora u bazi za testiranje.');
    END IF;
END;
/

PROMPT;

-- ============================================================================
-- Upit 4: Kombinacija obe funkcije
-- ============================================================================
PROMPT Upit 4: Kombinacija obe funkcije - trajanje i validacija
PROMPT ───────────────────────────────────────────────────────────────────

SELECT 
    n.NegotiationId,
    n.Status AS TrenutniStatus,
    fn_total_negotiation_duration(n.NegotiationId) AS Trajanje,
    fn_validate_negotiation_status(n.NegotiationId, 'Completed') AS MozeZavrsiti
FROM Negotiation n
WHERE ROWNUM <= 5
ORDER BY n.NegotiationId;

PROMPT;
PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT Funkcije uspešno kreirane i testirane!
PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT;
PROMPT Kreirane funkcije:
PROMPT   1. fn_total_negotiation_duration   - Računa ukupno trajanje
PROMPT   2. fn_validate_negotiation_status  - Validira promenu statusa
PROMPT;
PROMPT Obe funkcije mogu se koristiti u SQL upitima i PL/SQL blokovima.
PROMPT ═══════════════════════════════════════════════════════════════════
