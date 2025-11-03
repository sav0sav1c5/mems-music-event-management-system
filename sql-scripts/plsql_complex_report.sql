-- ============================================================================
-- PL/SQL KOMPLEKSAN IZVJEŠTAJ - ANALIZA WORKFLOW STAGES
-- ============================================================================
-- Autor: IIS Tim
-- Datum: 13. Oktobar 2025
-- Opis: Kompleksan izvještaj koji kombinuje sve zahtevane PL/SQL koncepte
-- ============================================================================

SET SERVEROUTPUT ON SIZE UNLIMITED;
SET LINESIZE 200;
SET PAGESIZE 100;

-- ============================================================================
-- KREIRANJE SLOŽENIH PL/SQL TIPOVA
-- ============================================================================

-- Tip za informacije o fazi pregovora
CREATE OR REPLACE TYPE t_phase_info AS OBJECT (
    phase_id NUMBER,
    phase_name VARCHAR2(200),
    order_number NUMBER,
    total_negotiations NUMBER,
    completed_negotiations NUMBER,
    average_duration NUMBER,
    completion_rate NUMBER
);
/

-- Tip za kolekciju faza (nested table)
CREATE OR REPLACE TYPE t_phase_info_table AS TABLE OF t_phase_info;
/

-- Tip za statističke podatke pregovora
CREATE OR REPLACE TYPE t_negotiation_stats AS OBJECT (
    negotiation_id NUMBER,
    performer_name VARCHAR2(200),
    event_name VARCHAR2(200),
    status VARCHAR2(50),
    current_phase NUMBER,
    total_duration NUMBER,
    requirements_fulfilled NUMBER,
    requirements_total NUMBER,
    fulfillment_percentage NUMBER
);
/

-- Tip za kolekciju statistike (nested table)
CREATE OR REPLACE TYPE t_negotiation_stats_table AS TABLE OF t_negotiation_stats;
/

-- ============================================================================
-- GLAVNA PROCEDURA ZA GENERISANJE IZVJEŠTAJA
-- ============================================================================

CREATE OR REPLACE PROCEDURE sp_workflow_analysis_report
IS
    -- Kursor za faze sa statistikom
    CURSOR cur_phase_statistics IS
        WITH PhaseMetrics AS (
            SELECT 
                p.PhaseId,
                p.PhaseName,
                p.OrderNumber,
                COUNT(DISTINCT np.NegotiationId) AS TotalNegotiations,
                SUM(CASE WHEN np.Status = 'Completed' THEN 1 ELSE 0 END) AS CompletedNegotiations,
                AVG(CASE 
                    WHEN np.Status = 'Completed' AND np.CompletedDate IS NOT NULL 
                         AND np.StartDate IS NOT NULL
                    THEN EXTRACT(DAY FROM (np.CompletedDate - np.StartDate))
                    ELSE NULL
                END) AS AvgDuration
            FROM Phase p
            LEFT JOIN NegotiationPhase np ON p.PhaseId = np.PhaseId
            GROUP BY p.PhaseId, p.PhaseName, p.OrderNumber
        )
        SELECT 
            PhaseId,
            PhaseName,
            OrderNumber,
            TotalNegotiations,
            CompletedNegotiations,
            ROUND(NVL(AvgDuration, 0), 1) AS AvgDuration,
            ROUND(
                (CompletedNegotiations * 100.0) / NULLIF(TotalNegotiations, 0),
                2
            ) AS CompletionRate
        FROM PhaseMetrics
        ORDER BY OrderNumber;
    
    -- Kursor za detaljnu statistiku pregovora
    CURSOR cur_negotiation_details IS
        WITH NegotiationMetrics AS (
            SELECT 
                n.NegotiationId,
                p.Name AS PerformerName,
                e.Name AS EventName,
                n.Status,
                n.CurrentPhaseOrder,
                fn_total_negotiation_duration(n.NegotiationId) AS TotalDuration,
                COUNT(nrf.FulfillmentId) AS TotalRequirements,
                SUM(CASE WHEN nrf.IsFulfilled = 1 THEN 1 ELSE 0 END) AS FulfilledRequirements
            FROM Negotiation n
            JOIN Performer p ON n.PerformerId = p.PerformerId
            JOIN Event e ON n.EventId = e.Id
            LEFT JOIN NegotiationRequirementFulfillment nrf ON n.NegotiationId = nrf.NegotiationId
            WHERE n.StartDate >= ADD_MONTHS(SYSDATE, -6) -- Poslednjih 6 meseci
            GROUP BY n.NegotiationId, p.Name, e.Name, n.Status, n.CurrentPhaseOrder
        )
        SELECT 
            NegotiationId,
            PerformerName,
            EventName,
            Status,
            CurrentPhaseOrder,
            TotalDuration,
            NVL(FulfilledRequirements, 0) AS FulfilledRequirements,
            TotalRequirements,
            ROUND(
                (NVL(FulfilledRequirements, 0) * 100.0) / NULLIF(TotalRequirements, 0),
                2
            ) AS FulfillmentPercentage
        FROM NegotiationMetrics
        ORDER BY Status DESC, TotalDuration DESC;
    
    -- Kursor za historiju promena statusa
    CURSOR cur_status_history(p_limit NUMBER) IS
        SELECT 
            nsl.NegotiationId,
            nsl.OldStatus,
            nsl.NewStatus,
            nsl.Duration,
            nsl.ChangedAt,
            p.Name AS PerformerName
        FROM NegotiationStatusLog nsl
        JOIN Negotiation n ON nsl.NegotiationId = n.NegotiationId
        JOIN Performer p ON n.PerformerId = p.PerformerId
        ORDER BY nsl.ChangedAt DESC
        FETCH FIRST p_limit ROWS ONLY;
    
    -- Promenljive za statistiku
    v_total_negotiations NUMBER := 0;
    v_active_negotiations NUMBER := 0;
    v_completed_negotiations NUMBER := 0;
    v_avg_duration NUMBER := 0;
    v_total_phases NUMBER := 0;
    
    -- Kolekcije
    v_phase_collection t_phase_info_table := t_phase_info_table();
    v_negotiation_collection t_negotiation_stats_table := t_negotiation_stats_table();
    
    -- Record promenljive
    v_phase_rec cur_phase_statistics%ROWTYPE;
    v_nego_rec cur_negotiation_details%ROWTYPE;
    
    -- Konstante za formatiranje
    c_separator CONSTANT VARCHAR2(100) := RPAD('═', 80, '═');
    c_line CONSTANT VARCHAR2(100) := RPAD('─', 80, '─');
    
BEGIN
    DBMS_OUTPUT.PUT_LINE(c_separator);
    DBMS_OUTPUT.PUT_LINE('IZVJEŠTAJ: ANALIZA WORKFLOW STAGES (FAZE RADNOG TOKA)');
    DBMS_OUTPUT.PUT_LINE('Generisan: ' || TO_CHAR(SYSDATE, 'DD.MM.YYYY HH24:MI:SS'));
    DBMS_OUTPUT.PUT_LINE('Period: Poslednjih 6 meseci');
    DBMS_OUTPUT.PUT_LINE(c_separator);
    DBMS_OUTPUT.PUT_LINE('');
    
    -- ========================================================================
    -- SEKCIJA 1: OPŠTA STATISTIKA
    -- ========================================================================
    
    -- Izračunaj ukupnu statistiku koristeći WITH klauzulu i agregacije
    WITH OverallStats AS (
        SELECT 
            COUNT(*) AS TotalCount,
            SUM(CASE WHEN Status IN ('InProgress', 'Pending') THEN 1 ELSE 0 END) AS ActiveCount,
            SUM(CASE WHEN Status = 'Completed' THEN 1 ELSE 0 END) AS CompletedCount,
            AVG(fn_total_negotiation_duration(NegotiationId)) AS AvgDur
        FROM Negotiation
        WHERE StartDate >= ADD_MONTHS(SYSDATE, -6)
    )
    SELECT TotalCount, ActiveCount, CompletedCount, AvgDur
    INTO v_total_negotiations, v_active_negotiations, v_completed_negotiations, v_avg_duration
    FROM OverallStats;
    
    -- Broj faza
    SELECT COUNT(*) INTO v_total_phases FROM Phase;
    
    DBMS_OUTPUT.PUT_LINE('╔══════════════════════════════════════════════════════════════╗');
    DBMS_OUTPUT.PUT_LINE('║              OPŠTA STATISTIKA PREGOVORA                      ║');
    DBMS_OUTPUT.PUT_LINE('╚══════════════════════════════════════════════════════════════╝');
    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE('  Ukupno pregovora:        ' || v_total_negotiations);
    DBMS_OUTPUT.PUT_LINE('  Aktivni pregovori:       ' || v_active_negotiations);
    DBMS_OUTPUT.PUT_LINE('  Završeni pregovori:      ' || v_completed_negotiations);
    DBMS_OUTPUT.PUT_LINE('  Prosečno trajanje:       ' || ROUND(v_avg_duration, 1) || ' dana');
    DBMS_OUTPUT.PUT_LINE('  Broj definisanih faza:   ' || v_total_phases);
    DBMS_OUTPUT.PUT_LINE('  Stopa završetka:         ' || 
        ROUND((v_completed_negotiations * 100.0) / NULLIF(v_total_negotiations, 0), 2) || '%');
    DBMS_OUTPUT.PUT_LINE('');
    
    -- ========================================================================
    -- SEKCIJA 2: STATISTIKA PO FAZAMA
    -- ========================================================================
    
    DBMS_OUTPUT.PUT_LINE(c_separator);
    DBMS_OUTPUT.PUT_LINE('╔══════════════════════════════════════════════════════════════╗');
    DBMS_OUTPUT.PUT_LINE('║         STATISTIKA PO FAZAMA (WORKFLOW STAGES)              ║');
    DBMS_OUTPUT.PUT_LINE('╚══════════════════════════════════════════════════════════════╝');
    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE(
        RPAD('Faza', 30) ||
        RPAD('Red', 6) ||
        RPAD('Ukupno', 10) ||
        RPAD('Završeno', 10) ||
        RPAD('Trajanje', 12) ||
        RPAD('Stopa %', 10)
    );
    DBMS_OUTPUT.PUT_LINE(c_line);
    
    -- Prolazi kroz faze koristeći kursor
    OPEN cur_phase_statistics;
    LOOP
        FETCH cur_phase_statistics INTO v_phase_rec;
        EXIT WHEN cur_phase_statistics%NOTFOUND;
        
        -- Popuni kolekciju
        v_phase_collection.EXTEND;
        v_phase_collection(v_phase_collection.COUNT) := t_phase_info(
            v_phase_rec.PhaseId,
            v_phase_rec.PhaseName,
            v_phase_rec.OrderNumber,
            v_phase_rec.TotalNegotiations,
            v_phase_rec.CompletedNegotiations,
            v_phase_rec.AvgDuration,
            v_phase_rec.CompletionRate
        );
        
        -- Ispiši red
        DBMS_OUTPUT.PUT_LINE(
            RPAD(SUBSTR(v_phase_rec.PhaseName, 1, 29), 30) ||
            RPAD(v_phase_rec.OrderNumber, 6) ||
            RPAD(v_phase_rec.TotalNegotiations, 10) ||
            RPAD(v_phase_rec.CompletedNegotiations, 10) ||
            RPAD(v_phase_rec.AvgDuration || ' dana', 12) ||
            RPAD(NVL(TO_CHAR(v_phase_rec.CompletionRate), 'N/A') || '%', 10)
        );
    END LOOP;
    CLOSE cur_phase_statistics;
    
    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE('  Ukupno faza obrađeno: ' || v_phase_collection.COUNT);
    DBMS_OUTPUT.PUT_LINE('');
    
    -- ========================================================================
    -- SEKCIJA 3: TOP 10 PREGOVORA PO TRAJANJU
    -- ========================================================================
    
    DBMS_OUTPUT.PUT_LINE(c_separator);
    DBMS_OUTPUT.PUT_LINE('╔══════════════════════════════════════════════════════════════╗');
    DBMS_OUTPUT.PUT_LINE('║         TOP 10 PREGOVORA PO TRAJANJU                         ║');
    DBMS_OUTPUT.PUT_LINE('╚══════════════════════════════════════════════════════════════╝');
    DBMS_OUTPUT.PUT_LINE('');
    
    OPEN cur_negotiation_details;
    LOOP
        FETCH cur_negotiation_details INTO v_nego_rec;
        EXIT WHEN cur_negotiation_details%NOTFOUND OR cur_negotiation_details%ROWCOUNT > 10;
        
        DBMS_OUTPUT.PUT_LINE('─────────────────────────────────────────────────────────────');
        DBMS_OUTPUT.PUT_LINE('  ID: ' || v_nego_rec.NegotiationId || 
                            '  │  Status: ' || v_nego_rec.Status ||
                            '  │  Faza: ' || v_nego_rec.CurrentPhaseOrder);
        DBMS_OUTPUT.PUT_LINE('  Izvođač: ' || SUBSTR(v_nego_rec.PerformerName, 1, 40));
        DBMS_OUTPUT.PUT_LINE('  Događaj: ' || SUBSTR(v_nego_rec.EventName, 1, 40));
        DBMS_OUTPUT.PUT_LINE('  Trajanje: ' || v_nego_rec.TotalDuration || ' dana');
        DBMS_OUTPUT.PUT_LINE('  Zahtevi: ' || v_nego_rec.FulfilledRequirements || '/' || 
                            v_nego_rec.TotalRequirements || 
                            ' (' || NVL(TO_CHAR(v_nego_rec.FulfillmentPercentage), '0') || '%)');
    END LOOP;
    CLOSE cur_negotiation_details;
    
    DBMS_OUTPUT.PUT_LINE('');
    
    -- ========================================================================
    -- SEKCIJA 4: DISTRIBUCIJA PO STATUSIMA
    -- ========================================================================
    
    DBMS_OUTPUT.PUT_LINE(c_separator);
    DBMS_OUTPUT.PUT_LINE('╔══════════════════════════════════════════════════════════════╗');
    DBMS_OUTPUT.PUT_LINE('║         DISTRIBUCIJA PREGOVORA PO STATUSIMA                  ║');
    DBMS_OUTPUT.PUT_LINE('╚══════════════════════════════════════════════════════════════╝');
    DBMS_OUTPUT.PUT_LINE('');
    
    -- Kompleksan upit sa GROUP BY, HAVING, WHERE i agregatnim funkcijama
    FOR status_rec IN (
        SELECT 
            n.Status,
            COUNT(*) AS BrojPregovora,
            ROUND(COUNT(*) * 100.0 / v_total_negotiations, 2) AS Procenat,
            ROUND(AVG(fn_total_negotiation_duration(n.NegotiationId)), 1) AS ProsecnoTrajanje,
            MIN(n.ProposedFee) AS MinCena,
            MAX(n.ProposedFee) AS MaxCena,
            ROUND(AVG(n.ProposedFee), 2) AS ProsecnaCena
        FROM Negotiation n
        WHERE n.StartDate >= ADD_MONTHS(SYSDATE, -6)
        GROUP BY n.Status
        HAVING COUNT(*) > 0
        ORDER BY BrojPregovora DESC
    ) LOOP
        DBMS_OUTPUT.PUT_LINE(
            RPAD(status_rec.Status, 20) ||
            RPAD(status_rec.BrojPregovora || ' (' || status_rec.Procenat || '%)', 20) ||
            RPAD('Trajanje: ' || status_rec.ProsecnoTrajanje || 'd', 20)
        );
        DBMS_OUTPUT.PUT_LINE(
            RPAD('  ', 20) ||
            'Cena: ' || TO_CHAR(status_rec.MinCena, '999,999,990.00') || ' - ' ||
            TO_CHAR(status_rec.MaxCena, '999,999,990.00') ||
            ' (avg: ' || TO_CHAR(status_rec.ProsecnaCena, '999,999,990.00') || ')'
        );
        DBMS_OUTPUT.PUT_LINE('');
    END LOOP;
    
    -- ========================================================================
    -- SEKCIJA 5: NEDAVNE PROMENE STATUSA (HISTORY LOG)
    -- ========================================================================
    
    DBMS_OUTPUT.PUT_LINE(c_separator);
    DBMS_OUTPUT.PUT_LINE('╔══════════════════════════════════════════════════════════════╗');
    DBMS_OUTPUT.PUT_LINE('║         POSLEDNJIH 10 PROMENA STATUSA                        ║');
    DBMS_OUTPUT.PUT_LINE('╚══════════════════════════════════════════════════════════════╝');
    DBMS_OUTPUT.PUT_LINE('');
    
    FOR history_rec IN cur_status_history(10) LOOP
        DBMS_OUTPUT.PUT_LINE(
            TO_CHAR(history_rec.ChangedAt, 'DD.MM.YYYY HH24:MI') || ' │ ' ||
            'Pregovor #' || history_rec.NegotiationId || ' │ ' ||
            RPAD(history_rec.OldStatus, 12) || ' → ' || RPAD(history_rec.NewStatus, 12) || ' │ ' ||
            'Trajanje: ' || history_rec.Duration || 'd'
        );
    END LOOP;
    
    DBMS_OUTPUT.PUT_LINE('');
    
    -- ========================================================================
    -- SEKCIJA 6: ANALIZA EFIKASNOSTI PO FAZAMA
    -- ========================================================================
    
    DBMS_OUTPUT.PUT_LINE(c_separator);
    DBMS_OUTPUT.PUT_LINE('╔══════════════════════════════════════════════════════════════╗');
    DBMS_OUTPUT.PUT_LINE('║         ANALIZA EFIKASNOSTI PO FAZAMA                        ║');
    DBMS_OUTPUT.PUT_LINE('╚══════════════════════════════════════════════════════════════╝');
    DBMS_OUTPUT.PUT_LINE('');
    
    -- Koristi prethodno popunjenu kolekciju
    FOR i IN 1..v_phase_collection.COUNT LOOP
        DECLARE
            v_phase t_phase_info := v_phase_collection(i);
            v_efficiency VARCHAR2(20);
        BEGIN
            -- Odredi efikasnost
            IF v_phase.completion_rate >= 80 THEN
                v_efficiency := '★★★★★ ODLIČNO';
            ELSIF v_phase.completion_rate >= 60 THEN
                v_efficiency := '★★★★☆ DOBRO';
            ELSIF v_phase.completion_rate >= 40 THEN
                v_efficiency := '★★★☆☆ UMERENO';
            ELSE
                v_efficiency := '★★☆☆☆ SLABO';
            END IF;
            
            DBMS_OUTPUT.PUT_LINE(
                RPAD('Faza ' || v_phase.order_number || ': ' || v_phase.phase_name, 40) ||
                ' │ ' || v_efficiency || ' (' || 
                NVL(TO_CHAR(v_phase.completion_rate), 'N/A') || '%)'
            );
        END;
    END LOOP;
    
    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE(c_separator);
    DBMS_OUTPUT.PUT_LINE('KRAJ IZVJEŠTAJA');
    DBMS_OUTPUT.PUT_LINE(c_separator);
    
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('');
        DBMS_OUTPUT.PUT_LINE('GREŠKA: ' || SQLERRM);
        DBMS_OUTPUT.PUT_LINE('Izvještaj nije mogao biti završen.');
        
        -- Zatvori kursore ako su otvoreni
        IF cur_phase_statistics%ISOPEN THEN CLOSE cur_phase_statistics; END IF;
        IF cur_negotiation_details%ISOPEN THEN CLOSE cur_negotiation_details; END IF;
        
        RAISE;
END sp_workflow_analysis_report;
/

-- ============================================================================
-- POKRETANJE IZVJEŠTAJA
-- ============================================================================

PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT POKRETANJE KOMPLEKSNOG IZVJEŠTAJA
PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT;

BEGIN
    sp_workflow_analysis_report;
END;
/

PROMPT;
PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT Izvještaj uspešno generisan!
PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT;
PROMPT Korišćene PL/SQL tehnike:
PROMPT   ✓ Složeni PL/SQL tipovi (OBJECT, TABLE OF)
PROMPT   ✓ Nested table kolekcije
PROMPT   ✓ 3+ kursora (eksplicitni i parametarski)
PROMPT   ✓ WITH klauzula (CTE)
PROMPT   ✓ JOIN preko 3+ tabela
PROMPT   ✓ GROUP BY, HAVING, WHERE
PROMPT   ✓ Agregatne funkcije (COUNT, SUM, AVG, MIN, MAX)
PROMPT   ✓ Pozivanje PL/SQL funkcije (fn_total_negotiation_duration)
PROMPT   ✓ Record tipovi
PROMPT   ✓ Exception handling
PROMPT ═══════════════════════════════════════════════════════════════════
