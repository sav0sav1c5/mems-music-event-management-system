-- ============================================================================
-- PL/SQL FUNCTION FOR PERFORMER NEGOTIATIONS SUBSYSTEM
-- ============================================================================
-- Author: IIS Project Team
-- Date: October 13, 2025
-- Description: A function that calculates the negotiation complexity score
--              based on multiple factors: number of phases, requirements,
--              proposed fee, and negotiation duration
-- ============================================================================

-- ============================================================================
-- FUNCTION: Calculate Negotiation Complexity Score
-- ============================================================================
-- Purpose: Calculates a complexity score (0-100) for a negotiation based on:
--          - Number of phases involved (weight: 20%)
--          - Number of total requirements (weight: 30%)
--          - Proposed fee relative to performer's price range (weight: 25%)
--          - Negotiation duration in days (weight: 25%)
--
-- Parameters:
--   p_negotiation_id - The ID of the negotiation to evaluate
--
-- Returns: 
--   NUMBER - Complexity score between 0 and 100
--            0-30: Simple negotiation
--            31-60: Moderate complexity
--            61-100: High complexity
--
-- Usage Example:
--   SELECT NegotiationId, 
--          fn_calculate_negotiation_complexity(NegotiationId) AS ComplexityScore
--   FROM Negotiation
--   WHERE Status = 'InProgress';
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_calculate_negotiation_complexity(
    p_negotiation_id IN NUMBER
) RETURN NUMBER
IS
    v_phase_count NUMBER := 0;
    v_requirement_count NUMBER := 0;
    v_proposed_fee NUMBER := 0;
    v_performer_min_price NUMBER := 0;
    v_performer_max_price NUMBER := 0;
    v_duration_days NUMBER := 0;
    
    -- Component scores (0-100 each)
    v_phase_score NUMBER := 0;
    v_requirement_score NUMBER := 0;
    v_fee_score NUMBER := 0;
    v_duration_score NUMBER := 0;
    
    -- Final weighted score
    v_complexity_score NUMBER := 0;
    
    -- Constants for scoring thresholds
    c_max_phases CONSTANT NUMBER := 10;      -- 10+ phases = max complexity
    c_max_requirements CONSTANT NUMBER := 50; -- 50+ requirements = max complexity
    c_max_duration CONSTANT NUMBER := 90;    -- 90+ days = max complexity
    
BEGIN
    -- Get negotiation details
    SELECT 
        n.ProposedFee,
        (n.EndDate - n.StartDate) AS Duration,
        p.MinPrice,
        p.MaxPrice
    INTO 
        v_proposed_fee,
        v_duration_days,
        v_performer_min_price,
        v_performer_max_price
    FROM Negotiation n
    JOIN Performer p ON n.PerformerId = p.PerformerId
    WHERE n.NegotiationId = p_negotiation_id;
    
    -- Count phases in this negotiation
    SELECT COUNT(*)
    INTO v_phase_count
    FROM NegotiationPhase
    WHERE NegotiationId = p_negotiation_id;
    
    -- Count total requirements across all phases
    SELECT COUNT(*)
    INTO v_requirement_count
    FROM NegotiationRequirementFulfillment
    WHERE NegotiationId = p_negotiation_id;
    
    -- ========================================================================
    -- CALCULATE COMPONENT SCORES
    -- ========================================================================
    
    -- 1. Phase Score (0-100): More phases = higher complexity
    v_phase_score := LEAST(100, (v_phase_count / c_max_phases) * 100);
    
    -- 2. Requirement Score (0-100): More requirements = higher complexity
    v_requirement_score := LEAST(100, (v_requirement_count / c_max_requirements) * 100);
    
    -- 3. Fee Score (0-100): Fee outside performer's range = higher complexity
    --    Fee below min or above max = 100 (very complex negotiation)
    --    Fee within range = lower score based on position in range
    IF v_proposed_fee < v_performer_min_price THEN
        -- Below minimum - very complex
        v_fee_score := 100;
    ELSIF v_proposed_fee > v_performer_max_price THEN
        -- Above maximum - also complex but slightly less
        v_fee_score := 90;
    ELSE
        -- Within range - score based on distance from middle
        DECLARE
            v_mid_price NUMBER;
            v_price_range NUMBER;
            v_distance_from_mid NUMBER;
        BEGIN
            v_mid_price := (v_performer_max_price + v_performer_min_price) / 2;
            v_price_range := v_performer_max_price - v_performer_min_price;
            
            IF v_price_range > 0 THEN
                v_distance_from_mid := ABS(v_proposed_fee - v_mid_price);
                -- Closer to extremes = higher score (more complex negotiation)
                v_fee_score := (v_distance_from_mid / (v_price_range / 2)) * 50;
            ELSE
                v_fee_score := 0; -- No range = no complexity from price
            END IF;
        END;
    END IF;
    
    -- 4. Duration Score (0-100): Longer duration = higher complexity
    v_duration_score := LEAST(100, (v_duration_days / c_max_duration) * 100);
    
    -- ========================================================================
    -- CALCULATE WEIGHTED FINAL SCORE
    -- ========================================================================
    -- Weights: Phase(20%), Requirements(30%), Fee(25%), Duration(25%)
    v_complexity_score := ROUND(
        (v_phase_score * 0.20) +
        (v_requirement_score * 0.30) +
        (v_fee_score * 0.25) +
        (v_duration_score * 0.25)
    );
    
    -- Ensure score is between 0 and 100
    v_complexity_score := LEAST(100, GREATEST(0, v_complexity_score));
    
    RETURN v_complexity_score;
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        -- Negotiation not found
        RETURN 0;
    WHEN OTHERS THEN
        -- Log error and return 0
        DBMS_OUTPUT.PUT_LINE('Error calculating complexity for negotiation ' || 
                            p_negotiation_id || ': ' || SQLERRM);
        RETURN 0;
END fn_calculate_negotiation_complexity;
/

-- ============================================================================
-- DEMONSTRATION QUERIES
-- ============================================================================

-- Query 1: Show complexity scores for all active negotiations
SELECT 
    n.NegotiationId,
    n.Status,
    p.Name AS PerformerName,
    e.Name AS EventName,
    n.ProposedFee,
    (n.EndDate - n.StartDate) AS DurationDays,
    fn_calculate_negotiation_complexity(n.NegotiationId) AS ComplexityScore,
    CASE 
        WHEN fn_calculate_negotiation_complexity(n.NegotiationId) <= 30 THEN 'SIMPLE'
        WHEN fn_calculate_negotiation_complexity(n.NegotiationId) <= 60 THEN 'MODERATE'
        ELSE 'HIGH'
    END AS ComplexityLevel
FROM Negotiation n
JOIN Performer p ON n.PerformerId = p.PerformerId
JOIN Event e ON n.EventId = e.Id
WHERE n.Status IN ('InProgress', 'Pending')
ORDER BY ComplexityScore DESC;

-- Query 2: Find negotiations that need attention (high complexity + in progress)
SELECT 
    n.NegotiationId,
    p.Name AS PerformerName,
    n.CurrentPhaseOrder,
    fn_calculate_negotiation_complexity(n.NegotiationId) AS ComplexityScore
FROM Negotiation n
JOIN Performer p ON n.PerformerId = p.PerformerId
WHERE n.Status = 'InProgress'
  AND fn_calculate_negotiation_complexity(n.NegotiationId) > 60
ORDER BY ComplexityScore DESC;

-- Query 3: Average complexity by performer
SELECT 
    p.PerformerId,
    p.Name AS PerformerName,
    COUNT(n.NegotiationId) AS TotalNegotiations,
    ROUND(AVG(fn_calculate_negotiation_complexity(n.NegotiationId)), 2) AS AvgComplexity
FROM Performer p
JOIN Negotiation n ON p.PerformerId = n.PerformerId
GROUP BY p.PerformerId, p.Name
HAVING COUNT(n.NegotiationId) > 0
ORDER BY AvgComplexity DESC;

-- ============================================================================
-- END OF FUNCTION
-- ============================================================================

-- Verification message
SELECT 'Function fn_calculate_negotiation_complexity created successfully!' AS Status FROM DUAL;
