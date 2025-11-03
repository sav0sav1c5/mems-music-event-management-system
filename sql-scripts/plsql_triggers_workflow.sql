-- ============================================================================
-- PL/SQL TRIGERI ZA ANALIZU WORKFLOW STAGES (FAZE RADNOG TOKA)
-- ============================================================================
-- Autor: IIS Tim
-- Datum: 13. Oktobar 2025
-- Opis: Tri trigera koji prate promene u fazama pregovora i loguju statistiku
-- ============================================================================

-- ============================================================================
-- KREIRANJE POMOĆNE TABELE ZA LOGOVANJE
-- ============================================================================

-- Tabela za praćenje promena statusa pregovora
CREATE TABLE NegotiationStatusLog (
    LogId NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    NegotiationId NUMBER NOT NULL,
    OldStatus VARCHAR2(50),
    NewStatus VARCHAR2(50),
    ChangedAt TIMESTAMP DEFAULT SYSTIMESTAMP,
    ChangedBy VARCHAR2(100),
    Duration NUMBER, -- Trajanje u prethodnom statusu (u danima)
    CONSTRAINT fk_nego_log FOREIGN KEY (NegotiationId) 
        REFERENCES Negotiation(NegotiationId)
);

-- Tabela za agregatnu statistiku po fazama
CREATE TABLE PhaseStatistics (
    PhaseId NUMBER PRIMARY KEY,
    PhaseName VARCHAR2(200),
    TotalNegotiations NUMBER DEFAULT 0,
    CompletedNegotiations NUMBER DEFAULT 0,
    AverageDuration NUMBER DEFAULT 0, -- Prosečno trajanje u danima
    LastUpdated TIMESTAMP DEFAULT SYSTIMESTAMP,
    CONSTRAINT fk_phase_stats FOREIGN KEY (PhaseId) 
        REFERENCES Phase(PhaseId)
);

-- Inicijalizacija statistike za sve postojeće faze
INSERT INTO PhaseStatistics (PhaseId, PhaseName, TotalNegotiations, CompletedNegotiations, AverageDuration)
SELECT 
    p.PhaseId,
    p.PhaseName,
    0,
    0,
    0
FROM Phase p
WHERE NOT EXISTS (SELECT 1 FROM PhaseStatistics ps WHERE ps.PhaseId = p.PhaseId);

COMMIT;

-- ============================================================================
-- TRIGGER 1: Logovanje promene statusa pregovora
-- ============================================================================
-- Aktivira se pri UPDATE statusa na Negotiation tabeli
-- Loguje svaku promenu statusa i računa trajanje u prethodnom statusu
-- ============================================================================

CREATE OR REPLACE TRIGGER trg_log_negotiation_status_change
AFTER UPDATE OF Status ON Negotiation
FOR EACH ROW
WHEN (OLD.Status != NEW.Status) -- Samo kada se status stvarno promeni
DECLARE
    v_duration NUMBER;
    v_last_change_date TIMESTAMP;
BEGIN
    -- Izračunaj trajanje u prethodnom statusu
    BEGIN
        SELECT MAX(ChangedAt) INTO v_last_change_date
        FROM NegotiationStatusLog
        WHERE NegotiationId = :NEW.NegotiationId;
        
        IF v_last_change_date IS NOT NULL THEN
            v_duration := EXTRACT(DAY FROM (SYSTIMESTAMP - v_last_change_date));
        ELSE
            -- Ako nema prethodnog loga, računaj od StartDate
            v_duration := EXTRACT(DAY FROM (SYSTIMESTAMP - :NEW.StartDate));
        END IF;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            v_duration := EXTRACT(DAY FROM (SYSTIMESTAMP - :NEW.StartDate));
    END;
    
    -- Upiši log zapis
    INSERT INTO NegotiationStatusLog (
        NegotiationId,
        OldStatus,
        NewStatus,
        ChangedAt,
        ChangedBy,
        Duration
    ) VALUES (
        :NEW.NegotiationId,
        :OLD.Status,
        :NEW.Status,
        SYSTIMESTAMP,
        USER, -- Oracle korisnik koji je izvršio promenu
        v_duration
    );
    
    DBMS_OUTPUT.PUT_LINE('Status pregovora ' || :NEW.NegotiationId || 
                        ' promenjen: ' || :OLD.Status || ' → ' || :NEW.Status ||
                        ' (Trajanje: ' || v_duration || ' dana)');
                        
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Greška u trg_log_negotiation_status_change: ' || SQLERRM);
        RAISE;
END trg_log_negotiation_status_change;
/

-- ============================================================================
-- TRIGGER 2: Ažuriranje agregatne statistike po fazama
-- ============================================================================
-- Aktivira se kada se menja status NegotiationPhase
-- Ažurira PhaseStatistics tabelu sa novim agregatnim podacima
-- ============================================================================

CREATE OR REPLACE TRIGGER trg_update_phase_statistics
AFTER INSERT OR UPDATE OR DELETE ON NegotiationPhase
FOR EACH ROW
DECLARE
    v_phase_id NUMBER;
    v_total_negotiations NUMBER;
    v_completed_negotiations NUMBER;
    v_avg_duration NUMBER;
BEGIN
    -- Odredi PhaseId zavisno od operacije
    IF DELETING THEN
        v_phase_id := :OLD.PhaseId;
    ELSE
        v_phase_id := :NEW.PhaseId;
    END IF;
    
    -- Izračunaj nove agregatne podatke za ovu fazu
    SELECT 
        COUNT(DISTINCT np.NegotiationId),
        SUM(CASE WHEN np.Status = 'Completed' THEN 1 ELSE 0 END),
        AVG(CASE 
            WHEN np.Status = 'Completed' AND np.CompletedDate IS NOT NULL 
                 AND np.StartDate IS NOT NULL
            THEN EXTRACT(DAY FROM (np.CompletedDate - np.StartDate))
            ELSE NULL
        END)
    INTO 
        v_total_negotiations,
        v_completed_negotiations,
        v_avg_duration
    FROM NegotiationPhase np
    WHERE np.PhaseId = v_phase_id;
    
    -- Ažuriraj statistiku (ili umetni ako ne postoji)
    MERGE INTO PhaseStatistics ps
    USING (
        SELECT v_phase_id AS PhaseId FROM DUAL
    ) src
    ON (ps.PhaseId = src.PhaseId)
    WHEN MATCHED THEN
        UPDATE SET
            TotalNegotiations = v_total_negotiations,
            CompletedNegotiations = NVL(v_completed_negotiations, 0),
            AverageDuration = NVL(v_avg_duration, 0),
            LastUpdated = SYSTIMESTAMP
    WHEN NOT MATCHED THEN
        INSERT (PhaseId, PhaseName, TotalNegotiations, CompletedNegotiations, AverageDuration)
        SELECT 
            v_phase_id,
            (SELECT PhaseName FROM Phase WHERE PhaseId = v_phase_id),
            v_total_negotiations,
            NVL(v_completed_negotiations, 0),
            NVL(v_avg_duration, 0)
        FROM DUAL;
    
    DBMS_OUTPUT.PUT_LINE('Statistika ažurirana za fazu ' || v_phase_id || 
                        ': Ukupno=' || v_total_negotiations || 
                        ', Završeno=' || NVL(v_completed_negotiations, 0));
                        
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Greška u trg_update_phase_statistics: ' || SQLERRM);
        -- Ne prekidaj transakciju zbog greške u statistici
        NULL;
END trg_update_phase_statistics;
/

-- ============================================================================
-- TRIGGER 3: Automatsko logovanje završetka faze
-- ============================================================================
-- Aktivira se kada se NegotiationPhase označi kao završena
-- Proverava da li su svi uslovi ispunjeni i loguje napredak
-- ============================================================================

CREATE OR REPLACE TRIGGER trg_log_phase_completion
AFTER UPDATE OF Status ON NegotiationPhase
FOR EACH ROW
WHEN (NEW.Status = 'Completed' AND OLD.Status != 'Completed')
DECLARE
    v_phase_name VARCHAR2(200);
    v_negotiation_status VARCHAR2(50);
    v_total_requirements NUMBER;
    v_fulfilled_requirements NUMBER;
    v_completion_rate NUMBER;
BEGIN
    -- Dohvati naziv faze
    SELECT PhaseName INTO v_phase_name
    FROM Phase
    WHERE PhaseId = :NEW.PhaseId;
    
    -- Dohvati status pregovora
    SELECT Status INTO v_negotiation_status
    FROM Negotiation
    WHERE NegotiationId = :NEW.NegotiationId;
    
    -- Izračunaj stepen ispunjenosti zahteva u ovoj fazi
    SELECT 
        COUNT(*),
        SUM(CASE WHEN IsFulfilled = 1 THEN 1 ELSE 0 END)
    INTO 
        v_total_requirements,
        v_fulfilled_requirements
    FROM NegotiationRequirementFulfillment
    WHERE NegotiationId = :NEW.NegotiationId
      AND PhaseId = :NEW.PhaseId;
    
    IF v_total_requirements > 0 THEN
        v_completion_rate := ROUND((v_fulfilled_requirements / v_total_requirements) * 100, 2);
    ELSE
        v_completion_rate := 100; -- Ako nema zahteva, smatraj da je 100% završeno
    END IF;
    
    -- Loguj završetak faze
    DBMS_OUTPUT.PUT_LINE('═══════════════════════════════════════════════════════');
    DBMS_OUTPUT.PUT_LINE('FAZA ZAVRŠENA: ' || v_phase_name);
    DBMS_OUTPUT.PUT_LINE('Pregovor ID: ' || :NEW.NegotiationId);
    DBMS_OUTPUT.PUT_LINE('Status pregovora: ' || v_negotiation_status);
    DBMS_OUTPUT.PUT_LINE('Ispunjeno zahteva: ' || v_fulfilled_requirements || '/' || v_total_requirements);
    DBMS_OUTPUT.PUT_LINE('Stopa završetka: ' || v_completion_rate || '%');
    
    IF :NEW.StartDate IS NOT NULL AND :NEW.CompletedDate IS NOT NULL THEN
        DBMS_OUTPUT.PUT_LINE('Trajanje faze: ' || 
            ROUND(EXTRACT(DAY FROM (:NEW.CompletedDate - :NEW.StartDate)), 1) || ' dana');
    END IF;
    
    DBMS_OUTPUT.PUT_LINE('═══════════════════════════════════════════════════════');
    
    -- Opciono: Ako nisu svi zahtevi ispunjeni, loguj upozorenje
    IF v_completion_rate < 100 THEN
        DBMS_OUTPUT.PUT_LINE('⚠ UPOZORENJE: Faza označena kao završena, ali nisu svi zahtevi ispunjeni!');
    END IF;
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('Podaci o fazi ili pregovoru nisu pronađeni.');
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Greška u trg_log_phase_completion: ' || SQLERRM);
        NULL;
END trg_log_phase_completion;
/

-- ============================================================================
-- VERIFIKACIJA I TESTIRANJE
-- ============================================================================

SET SERVEROUTPUT ON SIZE UNLIMITED;

-- Proveri status trigera
SELECT trigger_name, status, trigger_type, triggering_event
FROM user_triggers
WHERE trigger_name IN (
    'TRG_LOG_NEGOTIATION_STATUS_CHANGE',
    'TRG_UPDATE_PHASE_STATISTICS',
    'TRG_LOG_PHASE_COMPLETION'
)
ORDER BY trigger_name;

PROMPT;
PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT Trigeri uspešno kreirani!
PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT;
PROMPT Kreirane pomoćne tabele:
PROMPT   - NegotiationStatusLog  (logovanje promena statusa)
PROMPT   - PhaseStatistics       (agregatna statistika po fazama)
PROMPT;
PROMPT Kreirani trigeri:
PROMPT   1. trg_log_negotiation_status_change  (loguje promenu statusa)
PROMPT   2. trg_update_phase_statistics        (ažurira statistiku faza)
PROMPT   3. trg_log_phase_completion           (loguje završetak faze)
PROMPT;
PROMPT Za testiranje:
PROMPT   UPDATE Negotiation SET Status = 'InProgress' WHERE NegotiationId = 1;
PROMPT   UPDATE NegotiationPhase SET Status = 'Completed' WHERE NegotiationId = 1 AND PhaseId = 1;
PROMPT ═══════════════════════════════════════════════════════════════════
