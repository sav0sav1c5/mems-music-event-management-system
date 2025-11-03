-- ============================================================================
-- PL/SQL COMPLEX REPORT FOR PERFORMER NEGOTIATIONS SUBSYSTEM
-- ============================================================================
-- Author: IIS Project Team
-- Date: October 13, 2025
-- Description: Comprehensive analytical report showing negotiation performance
--              metrics across performers, events, and phases with advanced
--              PL/SQL features
-- ============================================================================

-- ============================================================================
-- REPORT: Performer Negotiation Success Analysis
-- ============================================================================
-- This report demonstrates:
-- 1. Complex PL/SQL types (records, collections)
-- 2. Cursor usage with advanced features
-- 3. Multi-table JOINs (4+ tables)
-- 4. GROUP BY, HAVING, WHERE clauses
-- 5. Aggregation functions (COUNT, SUM, AVG, MAX)
-- 6. WITH clause (CTE) for query modularity
-- 7. Analytical business logic
-- ============================================================================

SET SERVEROUTPUT ON SIZE UNLIMITED;
SET LINESIZE 200;
SET PAGESIZE 100;

-- ============================================================================
-- PART 1: DEFINE COMPLEX PL/SQL TYPES
-- ============================================================================

-- Type for individual negotiation metrics
CREATE OR REPLACE TYPE t_negotiation_metrics AS OBJECT (
    negotiation_id NUMBER,
    performer_name VARCHAR2(200),
    event_name VARCHAR2(200),
    proposed_fee NUMBER(10,2),
    total_phases NUMBER,
    completed_phases NUMBER,
    total_requirements NUMBER,
    fulfilled_requirements NUMBER,
    fulfillment_percentage NUMBER(5,2),
    avg_phase_duration NUMBER,
    negotiation_status VARCHAR2(50),
    days_in_progress NUMBER,
    complexity_score NUMBER
);
/

-- Collection type for storing multiple negotiation metrics
CREATE OR REPLACE TYPE t_negotiation_metrics_table AS TABLE OF t_negotiation_metrics;
/

-- Type for performer summary statistics
CREATE OR REPLACE TYPE t_performer_summary AS OBJECT (
    performer_id NUMBER,
    performer_name VARCHAR2(200),
    performer_genre VARCHAR2(100),
    total_negotiations NUMBER,
    successful_negotiations NUMBER,
    success_rate NUMBER(5,2),
    avg_proposed_fee NUMBER(10,2),
    avg_negotiation_duration NUMBER,
    total_revenue NUMBER(12,2),
    avg_complexity_score NUMBER(5,2)
);
/

CREATE OR REPLACE TYPE t_performer_summary_table AS TABLE OF t_performer_summary;
/

-- ============================================================================
-- PART 2: COMPLEX SQL QUERY WITH CTE (Common Table Expression)
-- ============================================================================

-- This query can be run independently to see the data
WITH 
-- CTE 1: Calculate negotiation phase statistics
NegotiationPhaseStats AS (
    SELECT 
        n.NegotiationId,
        n.PerformerId,
        n.EventId,
        n.Status AS NegotiationStatus,
        n.ProposedFee,
        n.StartDate,
        n.EndDate,
        (n.EndDate - n.StartDate) AS DurationDays,
        COUNT(DISTINCT np.PhaseId) AS TotalPhases,
        SUM(CASE WHEN np.Status = 'Completed' THEN 1 ELSE 0 END) AS CompletedPhases,
        AVG(CASE 
            WHEN np.CompletedDate IS NOT NULL AND np.StartDate IS NOT NULL 
            THEN np.CompletedDate - np.StartDate 
            ELSE NULL 
        END) AS AvgPhaseDuration
    FROM Negotiation n
    LEFT JOIN NegotiationPhase np ON n.NegotiationId = np.NegotiationId
    WHERE n.StartDate >= ADD_MONTHS(SYSDATE, -12) -- Last 12 months
    GROUP BY 
        n.NegotiationId, n.PerformerId, n.EventId, n.Status,
        n.ProposedFee, n.StartDate, n.EndDate
),
-- CTE 2: Calculate requirement fulfillment statistics
RequirementStats AS (
    SELECT 
        nrf.NegotiationId,
        COUNT(nrf.FulfillmentId) AS TotalRequirements,
        SUM(CASE WHEN nrf.IsFulfilled = 1 THEN 1 ELSE 0 END) AS FulfilledRequirements,
        ROUND(
            (SUM(CASE WHEN nrf.IsFulfilled = 1 THEN 1 ELSE 0 END) * 100.0) / 
            NULLIF(COUNT(nrf.FulfillmentId), 0), 
            2
        ) AS FulfillmentPercentage
    FROM NegotiationRequirementFulfillment nrf
    GROUP BY nrf.NegotiationId
),
-- CTE 3: Combine all metrics with performer and event details
DetailedMetrics AS (
    SELECT 
        nps.NegotiationId,
        p.PerformerId,
        p.Name AS PerformerName,
        p.Genre AS PerformerGenre,
        p.MinPrice AS PerformerMinPrice,
        p.MaxPrice AS PerformerMaxPrice,
        e.Name AS EventName,
        e.Interval AS EventDate,
        nps.ProposedFee,
        nps.NegotiationStatus,
        nps.TotalPhases,
        nps.CompletedPhases,
        NVL(rs.TotalRequirements, 0) AS TotalRequirements,
        NVL(rs.FulfilledRequirements, 0) AS FulfilledRequirements,
        NVL(rs.FulfillmentPercentage, 0) AS FulfillmentPercentage,
        nps.AvgPhaseDuration,
        nps.DurationDays,
        -- Calculate if negotiation is successful
        CASE 
            WHEN nps.NegotiationStatus = 'Completed' AND nps.CompletedPhases = nps.TotalPhases 
            THEN 1 
            ELSE 0 
        END AS IsSuccessful
    FROM NegotiationPhaseStats nps
    JOIN Performer p ON nps.PerformerId = p.PerformerId
    JOIN Event e ON nps.EventId = e.Id
    LEFT JOIN RequirementStats rs ON nps.NegotiationId = rs.NegotiationId
)
-- Main query: Performer-level aggregation with business metrics
SELECT 
    dm.PerformerId,
    dm.PerformerName,
    dm.PerformerGenre,
    COUNT(dm.NegotiationId) AS TotalNegotiations,
    SUM(dm.IsSuccessful) AS SuccessfulNegotiations,
    ROUND((SUM(dm.IsSuccessful) * 100.0) / NULLIF(COUNT(dm.NegotiationId), 0), 2) AS SuccessRate,
    ROUND(AVG(dm.ProposedFee), 2) AS AvgProposedFee,
    ROUND(AVG(dm.DurationDays), 1) AS AvgNegotiationDuration,
    ROUND(SUM(CASE WHEN dm.IsSuccessful = 1 THEN dm.ProposedFee ELSE 0 END), 2) AS TotalRevenue,
    ROUND(AVG(dm.TotalPhases), 1) AS AvgPhasesPerNegotiation,
    ROUND(AVG(dm.FulfillmentPercentage), 2) AS AvgFulfillmentRate,
    MAX(dm.ProposedFee) AS HighestProposedFee,
    MIN(dm.ProposedFee) AS LowestProposedFee
FROM DetailedMetrics dm
GROUP BY 
    dm.PerformerId,
    dm.PerformerName,
    dm.PerformerGenre
HAVING COUNT(dm.NegotiationId) > 0 -- Only performers with negotiations
ORDER BY TotalRevenue DESC, SuccessRate DESC;

-- ============================================================================
-- PART 3: PL/SQL PROCEDURE TO GENERATE DETAILED REPORT
-- ============================================================================

CREATE OR REPLACE PROCEDURE sp_generate_negotiation_report
IS
    -- Cursor for detailed negotiation data
    CURSOR cur_negotiation_details IS
        WITH 
        NegotiationPhaseStats AS (
            SELECT 
                n.NegotiationId,
                n.PerformerId,
                n.EventId,
                n.Status AS NegotiationStatus,
                n.ProposedFee,
                n.StartDate,
                n.EndDate,
                (n.EndDate - n.StartDate) AS DurationDays,
                COUNT(DISTINCT np.PhaseId) AS TotalPhases,
                SUM(CASE WHEN np.Status = 'Completed' THEN 1 ELSE 0 END) AS CompletedPhases,
                AVG(CASE 
                    WHEN np.CompletedDate IS NOT NULL AND np.StartDate IS NOT NULL 
                    THEN np.CompletedDate - np.StartDate 
                    ELSE NULL 
                END) AS AvgPhaseDuration
            FROM Negotiation n
            LEFT JOIN NegotiationPhase np ON n.NegotiationId = np.NegotiationId
            WHERE n.StartDate >= ADD_MONTHS(SYSDATE, -12)
            GROUP BY 
                n.NegotiationId, n.PerformerId, n.EventId, n.Status,
                n.ProposedFee, n.StartDate, n.EndDate
        ),
        RequirementStats AS (
            SELECT 
                nrf.NegotiationId,
                COUNT(nrf.FulfillmentId) AS TotalRequirements,
                SUM(CASE WHEN nrf.IsFulfilled = 1 THEN 1 ELSE 0 END) AS FulfilledRequirements,
                ROUND(
                    (SUM(CASE WHEN nrf.IsFulfilled = 1 THEN 1 ELSE 0 END) * 100.0) / 
                    NULLIF(COUNT(nrf.FulfillmentId), 0), 
                    2
                ) AS FulfillmentPercentage
            FROM NegotiationRequirementFulfillment nrf
            GROUP BY nrf.NegotiationId
        )
        SELECT 
            nps.NegotiationId,
            p.Name AS PerformerName,
            e.Name AS EventName,
            nps.ProposedFee,
            nps.TotalPhases,
            nps.CompletedPhases,
            NVL(rs.TotalRequirements, 0) AS TotalRequirements,
            NVL(rs.FulfilledRequirements, 0) AS FulfilledRequirements,
            NVL(rs.FulfillmentPercentage, 0) AS FulfillmentPercentage,
            nps.AvgPhaseDuration,
            nps.NegotiationStatus,
            nps.DurationDays
        FROM NegotiationPhaseStats nps
        JOIN Performer p ON nps.PerformerId = p.PerformerId
        JOIN Event e ON nps.EventId = e.Id
        LEFT JOIN RequirementStats rs ON nps.NegotiationId = rs.NegotiationId
        ORDER BY nps.NegotiationStatus, nps.ProposedFee DESC;
    
    -- Cursor for performer summary with parameters
    CURSOR cur_performer_summary(p_min_negotiations NUMBER) IS
        WITH DetailedMetrics AS (
            SELECT 
                p.PerformerId,
                p.Name AS PerformerName,
                p.Genre AS PerformerGenre,
                n.NegotiationId,
                n.ProposedFee,
                n.Status,
                (n.EndDate - n.StartDate) AS DurationDays,
                CASE 
                    WHEN n.Status = 'Completed' THEN 1 
                    ELSE 0 
                END AS IsSuccessful
            FROM Performer p
            JOIN Negotiation n ON p.PerformerId = n.PerformerId
            WHERE n.StartDate >= ADD_MONTHS(SYSDATE, -12)
        )
        SELECT 
            dm.PerformerId,
            dm.PerformerName,
            dm.PerformerGenre,
            COUNT(dm.NegotiationId) AS TotalNegotiations,
            SUM(dm.IsSuccessful) AS SuccessfulNegotiations,
            ROUND((SUM(dm.IsSuccessful) * 100.0) / NULLIF(COUNT(dm.NegotiationId), 0), 2) AS SuccessRate,
            ROUND(AVG(dm.ProposedFee), 2) AS AvgProposedFee,
            ROUND(AVG(dm.DurationDays), 1) AS AvgNegotiationDuration,
            ROUND(SUM(CASE WHEN dm.IsSuccessful = 1 THEN dm.ProposedFee ELSE 0 END), 2) AS TotalRevenue
        FROM DetailedMetrics dm
        GROUP BY 
            dm.PerformerId,
            dm.PerformerName,
            dm.PerformerGenre
        HAVING COUNT(dm.NegotiationId) >= p_min_negotiations
        ORDER BY TotalRevenue DESC;
    
    -- Variables for report statistics
    v_total_negotiations NUMBER := 0;
    v_successful_negotiations NUMBER := 0;
    v_total_revenue NUMBER := 0;
    v_avg_duration NUMBER := 0;
    
    -- Record variables
    v_negotiation_rec cur_negotiation_details%ROWTYPE;
    v_performer_rec cur_performer_summary%ROWTYPE;
    
    -- Collection variables
    v_metrics_collection t_negotiation_metrics_table := t_negotiation_metrics_table();
    
    -- Constants
    c_separator CONSTANT VARCHAR2(100) := RPAD('=', 80, '=');
    c_line CONSTANT VARCHAR2(100) := RPAD('-', 80, '-');
    
BEGIN
    DBMS_OUTPUT.PUT_LINE(c_separator);
    DBMS_OUTPUT.PUT_LINE('PERFORMER NEGOTIATION ANALYSIS REPORT');
    DBMS_OUTPUT.PUT_LINE('Generated: ' || TO_CHAR(SYSDATE, 'DD-MON-YYYY HH24:MI:SS'));
    DBMS_OUTPUT.PUT_LINE('Period: Last 12 Months');
    DBMS_OUTPUT.PUT_LINE(c_separator);
    DBMS_OUTPUT.PUT_LINE('');
    
    -- ========================================================================
    -- SECTION 1: OVERALL STATISTICS
    -- ========================================================================
    
    SELECT 
        COUNT(*),
        SUM(CASE WHEN Status = 'Completed' THEN 1 ELSE 0 END),
        SUM(CASE WHEN Status = 'Completed' THEN ProposedFee ELSE 0 END),
        AVG(EndDate - StartDate)
    INTO 
        v_total_negotiations,
        v_successful_negotiations,
        v_total_revenue,
        v_avg_duration
    FROM Negotiation
    WHERE StartDate >= ADD_MONTHS(SYSDATE, -12);
    
    DBMS_OUTPUT.PUT_LINE('OVERALL STATISTICS:');
    DBMS_OUTPUT.PUT_LINE(c_line);
    DBMS_OUTPUT.PUT_LINE('Total Negotiations:       ' || v_total_negotiations);
    DBMS_OUTPUT.PUT_LINE('Successful Negotiations:  ' || v_successful_negotiations);
    DBMS_OUTPUT.PUT_LINE('Success Rate:             ' || 
        ROUND((v_successful_negotiations * 100.0) / NULLIF(v_total_negotiations, 0), 2) || '%');
    DBMS_OUTPUT.PUT_LINE('Total Revenue:            $' || TO_CHAR(v_total_revenue, '999,999,990.00'));
    DBMS_OUTPUT.PUT_LINE('Avg Negotiation Duration: ' || ROUND(v_avg_duration, 1) || ' days');
    DBMS_OUTPUT.PUT_LINE('');
    
    -- ========================================================================
    -- SECTION 2: TOP PERFORMERS BY REVENUE
    -- ========================================================================
    
    DBMS_OUTPUT.PUT_LINE(c_separator);
    DBMS_OUTPUT.PUT_LINE('TOP PERFORMERS BY REVENUE (Min 1 Negotiation):');
    DBMS_OUTPUT.PUT_LINE(c_separator);
    DBMS_OUTPUT.PUT_LINE(
        RPAD('Performer', 25) || 
        RPAD('Genre', 15) || 
        RPAD('Total', 8) || 
        RPAD('Success', 8) || 
        RPAD('Rate%', 8) || 
        RPAD('Revenue', 12)
    );
    DBMS_OUTPUT.PUT_LINE(c_line);
    
    -- Open cursor with parameter
    OPEN cur_performer_summary(1);
    LOOP
        FETCH cur_performer_summary INTO v_performer_rec;
        EXIT WHEN cur_performer_summary%NOTFOUND OR cur_performer_summary%ROWCOUNT > 10;
        
        DBMS_OUTPUT.PUT_LINE(
            RPAD(SUBSTR(v_performer_rec.PerformerName, 1, 24), 25) ||
            RPAD(SUBSTR(v_performer_rec.PerformerGenre, 1, 14), 15) ||
            RPAD(v_performer_rec.TotalNegotiations, 8) ||
            RPAD(v_performer_rec.SuccessfulNegotiations, 8) ||
            RPAD(v_performer_rec.SuccessRate, 8) ||
            RPAD('$' || TO_CHAR(v_performer_rec.TotalRevenue, '999,990.00'), 12)
        );
    END LOOP;
    CLOSE cur_performer_summary;
    
    DBMS_OUTPUT.PUT_LINE('');
    
    -- ========================================================================
    -- SECTION 3: DETAILED NEGOTIATION BREAKDOWN
    -- ========================================================================
    
    DBMS_OUTPUT.PUT_LINE(c_separator);
    DBMS_OUTPUT.PUT_LINE('NEGOTIATION DETAILS (Recent 15):');
    DBMS_OUTPUT.PUT_LINE(c_separator);
    
    OPEN cur_negotiation_details;
    LOOP
        FETCH cur_negotiation_details INTO v_negotiation_rec;
        EXIT WHEN cur_negotiation_details%NOTFOUND OR cur_negotiation_details%ROWCOUNT > 15;
        
        DBMS_OUTPUT.PUT_LINE('Negotiation ID: ' || v_negotiation_rec.NegotiationId);
        DBMS_OUTPUT.PUT_LINE('  Performer:    ' || v_negotiation_rec.PerformerName);
        DBMS_OUTPUT.PUT_LINE('  Event:        ' || v_negotiation_rec.EventName);
        DBMS_OUTPUT.PUT_LINE('  Status:       ' || v_negotiation_rec.NegotiationStatus);
        DBMS_OUTPUT.PUT_LINE('  Fee:          $' || TO_CHAR(v_negotiation_rec.ProposedFee, '999,990.00'));
        DBMS_OUTPUT.PUT_LINE('  Phases:       ' || v_negotiation_rec.CompletedPhases || 
                            '/' || v_negotiation_rec.TotalPhases || ' completed');
        DBMS_OUTPUT.PUT_LINE('  Requirements: ' || v_negotiation_rec.FulfilledRequirements || 
                            '/' || v_negotiation_rec.TotalRequirements || 
                            ' (' || v_negotiation_rec.FulfillmentPercentage || '%)');
        DBMS_OUTPUT.PUT_LINE('  Duration:     ' || v_negotiation_rec.DurationDays || ' days');
        DBMS_OUTPUT.PUT_LINE('');
    END LOOP;
    CLOSE cur_negotiation_details;
    
    -- ========================================================================
    -- SECTION 4: STATUS DISTRIBUTION
    -- ========================================================================
    
    DBMS_OUTPUT.PUT_LINE(c_separator);
    DBMS_OUTPUT.PUT_LINE('NEGOTIATION STATUS DISTRIBUTION:');
    DBMS_OUTPUT.PUT_LINE(c_separator);
    
    FOR status_rec IN (
        SELECT 
            Status,
            COUNT(*) AS Count,
            ROUND((COUNT(*) * 100.0) / v_total_negotiations, 2) AS Percentage,
            SUM(ProposedFee) AS TotalFees
        FROM Negotiation
        WHERE StartDate >= ADD_MONTHS(SYSDATE, -12)
        GROUP BY Status
        ORDER BY Count DESC
    ) LOOP
        DBMS_OUTPUT.PUT_LINE(
            RPAD(status_rec.Status, 20) || 
            RPAD(status_rec.Count || ' (' || status_rec.Percentage || '%)', 20) ||
            'Total Fees: $' || TO_CHAR(status_rec.TotalFees, '999,999,990.00')
        );
    END LOOP;
    
    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE(c_separator);
    DBMS_OUTPUT.PUT_LINE('END OF REPORT');
    DBMS_OUTPUT.PUT_LINE(c_separator);
    
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('ERROR: ' || SQLERRM);
        IF cur_negotiation_details%ISOPEN THEN
            CLOSE cur_negotiation_details;
        END IF;
        IF cur_performer_summary%ISOPEN THEN
            CLOSE cur_performer_summary;
        END IF;
        RAISE;
END sp_generate_negotiation_report;
/

-- ============================================================================
-- PART 4: EXECUTE THE REPORT
-- ============================================================================

BEGIN
    sp_generate_negotiation_report;
END;
/

-- ============================================================================
-- END OF REPORT
-- ============================================================================

SELECT 'Complex report created and executed successfully!' AS Status FROM DUAL;
