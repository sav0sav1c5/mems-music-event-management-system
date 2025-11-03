-- ============================================================================
-- TEST SCENARIOS AND EXAMPLES FOR PL/SQL SCRIPTS
-- ============================================================================
-- This file provides sample queries and test scenarios to demonstrate
-- the functionality of the four PL/SQL scripts
-- ============================================================================

SET SERVEROUTPUT ON SIZE UNLIMITED;
SET LINESIZE 200;

-- ============================================================================
-- TEST 1: Testing the Complexity Function
-- ============================================================================
PROMPT ====================================================================
PROMPT TEST 1: Complexity Function Examples
PROMPT ====================================================================
PROMPT;

-- Example 1: Calculate complexity for a specific negotiation
PROMPT Example 1: Single negotiation complexity
SELECT 
    n.NegotiationId,
    n.Status,
    p.Name AS PerformerName,
    n.ProposedFee,
    fn_calculate_negotiation_complexity(n.NegotiationId) AS ComplexityScore
FROM Negotiation n
JOIN Performer p ON n.PerformerId = p.PerformerId
WHERE ROWNUM = 1;

PROMPT;

-- Example 2: Show all negotiations with complexity classification
PROMPT Example 2: All negotiations with complexity levels
SELECT 
    n.NegotiationId,
    n.Status,
    p.Name AS PerformerName,
    fn_calculate_negotiation_complexity(n.NegotiationId) AS ComplexityScore,
    CASE 
        WHEN fn_calculate_negotiation_complexity(n.NegotiationId) <= 30 THEN 'SIMPLE'
        WHEN fn_calculate_negotiation_complexity(n.NegotiationId) <= 60 THEN 'MODERATE'
        ELSE 'HIGH'
    END AS ComplexityLevel
FROM Negotiation n
JOIN Performer p ON n.PerformerId = p.PerformerId
WHERE ROWNUM <= 10
ORDER BY ComplexityScore DESC;

PROMPT;

-- Example 3: Find high-complexity negotiations needing attention
PROMPT Example 3: High-complexity negotiations in progress
SELECT 
    n.NegotiationId,
    p.Name AS PerformerName,
    e.Name AS EventName,
    n.CurrentPhaseOrder,
    fn_calculate_negotiation_complexity(n.NegotiationId) AS ComplexityScore
FROM Negotiation n
JOIN Performer p ON n.PerformerId = p.PerformerId
JOIN Event e ON n.EventId = e.Id
WHERE n.Status = 'InProgress'
  AND fn_calculate_negotiation_complexity(n.NegotiationId) > 60
ORDER BY ComplexityScore DESC;

PROMPT;

-- Example 4: Average complexity by performer genre
PROMPT Example 4: Average complexity by genre
SELECT 
    p.Genre,
    COUNT(n.NegotiationId) AS TotalNegotiations,
    ROUND(AVG(fn_calculate_negotiation_complexity(n.NegotiationId)), 2) AS AvgComplexity,
    MAX(fn_calculate_negotiation_complexity(n.NegotiationId)) AS MaxComplexity
FROM Performer p
JOIN Negotiation n ON p.PerformerId = n.PerformerId
GROUP BY p.Genre
HAVING COUNT(n.NegotiationId) > 0
ORDER BY AvgComplexity DESC;

PROMPT;

-- ============================================================================
-- TEST 2: Testing Triggers
-- ============================================================================
PROMPT ====================================================================
PROMPT TEST 2: Trigger Testing Instructions
PROMPT ====================================================================
PROMPT;
PROMPT To test triggers, you need to update actual data. Here are examples:
PROMPT;

-- Show current state of a negotiation
PROMPT Current negotiation state (before trigger test):
SELECT 
    n.NegotiationId,
    n.Status,
    n.CurrentPhaseOrder,
    np.PhaseId,
    np.Status AS PhaseStatus,
    COUNT(nrf.FulfillmentId) AS TotalRequirements,
    SUM(CASE WHEN nrf.IsFulfilled = 1 THEN 1 ELSE 0 END) AS FulfilledCount
FROM Negotiation n
JOIN NegotiationPhase np ON n.NegotiationId = np.NegotiationId
LEFT JOIN NegotiationRequirementFulfillment nrf ON n.NegotiationId = nrf.NegotiationId 
    AND np.PhaseId = nrf.PhaseId
WHERE n.NegotiationId = (SELECT MIN(NegotiationId) FROM Negotiation WHERE Status = 'InProgress')
  AND np.IsActive = 1
GROUP BY n.NegotiationId, n.Status, n.CurrentPhaseOrder, np.PhaseId, np.Status;

PROMPT;
PROMPT To test Trigger 1 (trg_update_negotiation_status):
PROMPT -- Find an unfulfilled requirement
PROMPT SELECT FulfillmentId, NegotiationId, RequirementId, IsFulfilled
PROMPT FROM NegotiationRequirementFulfillment
PROMPT WHERE IsFulfilled = 0 AND ROWNUM = 1;
PROMPT;
PROMPT -- Mark it as fulfilled (this will fire the trigger)
PROMPT UPDATE NegotiationRequirementFulfillment
PROMPT SET IsFulfilled = 1, FulfilledDate = SYSDATE, FulfilledBy = 'TEST_USER'
PROMPT WHERE FulfillmentId = [use_actual_id];
PROMPT;
PROMPT -- Check if negotiation advanced
PROMPT SELECT NegotiationId, Status, CurrentPhaseOrder FROM Negotiation 
PROMPT WHERE NegotiationId = [use_actual_id];
PROMPT;

PROMPT To test Trigger 2 (trg_update_contract_from_requirement):
PROMPT -- First, ensure a requirement has ContractUpdateAction
PROMPT UPDATE Requirement
PROMPT SET ContractUpdateAction = 'DEPOSIT_PAID'
PROMPT WHERE RequirementId = [use_actual_id];
PROMPT;
PROMPT -- Then fulfill the requirement (trigger fires)
PROMPT UPDATE NegotiationRequirementFulfillment
PROMPT SET IsFulfilled = 1
PROMPT WHERE RequirementId = [use_actual_id];
PROMPT;
PROMPT -- Check if contract was updated
PROMPT SELECT ContractId, PerformerId, IsDepositPaid FROM Contract
PROMPT WHERE PerformerId = [use_actual_performer_id];
PROMPT;

-- ============================================================================
-- TEST 3: Testing Index Performance
-- ============================================================================
PROMPT ====================================================================
PROMPT TEST 3: Index Performance Testing
PROMPT ====================================================================
PROMPT;

-- Show the optimized query that benefits from indexes
PROMPT Running the optimized query (using indexes):
SELECT 
    n.NegotiationId,
    n.Status AS NegotiationStatus,
    p.Name AS PerformerName,
    e.Name AS EventName,
    ph.PhaseName,
    COUNT(nrf.FulfillmentId) AS TotalRequirements,
    SUM(CASE WHEN nrf.IsFulfilled = 1 THEN 1 ELSE 0 END) AS FulfilledRequirements
FROM Negotiation n
JOIN Performer p ON n.PerformerId = p.PerformerId
JOIN Event e ON n.EventId = e.Id
JOIN NegotiationPhase np ON n.NegotiationId = np.NegotiationId
JOIN Phase ph ON np.PhaseId = ph.PhaseId
LEFT JOIN NegotiationRequirementFulfillment nrf ON n.NegotiationId = nrf.NegotiationId 
    AND np.PhaseId = nrf.PhaseId
WHERE n.Status IN ('InProgress', 'Pending')
  AND e.Interval >= SYSDATE
  AND np.IsActive = 1
GROUP BY 
    n.NegotiationId,
    n.Status,
    p.Name,
    e.Name,
    ph.PhaseName
HAVING SUM(CASE WHEN nrf.IsFulfilled = 1 THEN 1 ELSE 0 END) < COUNT(nrf.FulfillmentId)
ORDER BY n.NegotiationId;

PROMPT;

-- Check index usage
PROMPT Checking index statistics:
SELECT 
    i.index_name,
    i.table_name,
    i.status,
    i.num_rows,
    i.distinct_keys,
    i.blevel AS "Tree Depth"
FROM user_indexes i
WHERE i.index_name LIKE 'IDX_%'
ORDER BY i.table_name, i.index_name;

PROMPT;

-- ============================================================================
-- TEST 4: Report Generation
-- ============================================================================
PROMPT ====================================================================
PROMPT TEST 4: Generating Reports
PROMPT ====================================================================
PROMPT;

-- Execute the main report procedure
PROMPT Running full negotiation analysis report:
PROMPT;
EXEC sp_generate_negotiation_report;

PROMPT;

-- ============================================================================
-- TEST 5: Complex Analytical Queries Using All Components
-- ============================================================================
PROMPT ====================================================================
PROMPT TEST 5: Complex Analytical Queries
PROMPT ====================================================================
PROMPT;

-- Query 1: Negotiations with high complexity and low fulfillment
PROMPT Query 1: High-risk negotiations (high complexity + low fulfillment)
SELECT 
    n.NegotiationId,
    p.Name AS PerformerName,
    e.Name AS EventName,
    n.Status,
    fn_calculate_negotiation_complexity(n.NegotiationId) AS Complexity,
    ROUND(
        (SELECT SUM(CASE WHEN IsFulfilled = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)
         FROM NegotiationRequirementFulfillment nrf
         WHERE nrf.NegotiationId = n.NegotiationId),
        2
    ) AS FulfillmentRate
FROM Negotiation n
JOIN Performer p ON n.PerformerId = p.PerformerId
JOIN Event e ON n.EventId = e.Id
WHERE n.Status IN ('InProgress', 'Pending')
  AND fn_calculate_negotiation_complexity(n.NegotiationId) > 60
HAVING ROUND(
    (SELECT SUM(CASE WHEN IsFulfilled = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)
     FROM NegotiationRequirementFulfillment nrf
     WHERE nrf.NegotiationId = n.NegotiationId),
    2
) < 50
ORDER BY Complexity DESC;

PROMPT;

-- Query 2: Performer efficiency report
PROMPT Query 2: Performer efficiency (success rate vs. avg complexity)
SELECT 
    p.PerformerId,
    p.Name,
    p.Genre,
    COUNT(n.NegotiationId) AS TotalNegotiations,
    SUM(CASE WHEN n.Status = 'Completed' THEN 1 ELSE 0 END) AS Successful,
    ROUND(
        SUM(CASE WHEN n.Status = 'Completed' THEN 1 ELSE 0 END) * 100.0 / 
        NULLIF(COUNT(n.NegotiationId), 0),
        2
    ) AS SuccessRate,
    ROUND(AVG(fn_calculate_negotiation_complexity(n.NegotiationId)), 2) AS AvgComplexity,
    ROUND(AVG(n.EndDate - n.StartDate), 1) AS AvgDuration
FROM Performer p
JOIN Negotiation n ON p.PerformerId = n.PerformerId
GROUP BY p.PerformerId, p.Name, p.Genre
HAVING COUNT(n.NegotiationId) >= 1
ORDER BY SuccessRate DESC, AvgComplexity ASC;

PROMPT;

-- Query 3: Phase completion timeline analysis
PROMPT Query 3: Phase completion timeline analysis
SELECT 
    ph.PhaseName,
    ph.OrderNumber,
    COUNT(np.NegotiationId) AS TimesUsed,
    SUM(CASE WHEN np.Status = 'Completed' THEN 1 ELSE 0 END) AS CompletedCount,
    ROUND(
        AVG(CASE 
            WHEN np.Status = 'Completed' AND np.StartDate IS NOT NULL 
            THEN np.CompletedDate - np.StartDate 
        END),
        1
    ) AS AvgDaysToComplete,
    ph.EstimatedDuration AS EstimatedDays,
    ROUND(
        AVG(CASE 
            WHEN np.Status = 'Completed' AND np.StartDate IS NOT NULL 
            THEN np.CompletedDate - np.StartDate 
        END) - ph.EstimatedDuration,
        1
    ) AS DifferenceFromEstimate
FROM Phase ph
LEFT JOIN NegotiationPhase np ON ph.PhaseId = np.PhaseId
GROUP BY ph.PhaseId, ph.PhaseName, ph.OrderNumber, ph.EstimatedDuration
ORDER BY ph.OrderNumber;

PROMPT;

-- Query 4: Contract automation effectiveness
PROMPT Query 4: Contract update automation (Trigger 2 effectiveness)
SELECT 
    r.ContractUpdateAction,
    COUNT(DISTINCT nrf.FulfillmentId) AS RequirementsFulfilled,
    COUNT(DISTINCT c.ContractId) AS ContractsAffected,
    ROUND(
        COUNT(DISTINCT c.ContractId) * 100.0 / 
        NULLIF(COUNT(DISTINCT nrf.FulfillmentId), 0),
        2
    ) AS AutomationRate
FROM Requirement r
LEFT JOIN NegotiationRequirementFulfillment nrf ON r.RequirementId = nrf.RequirementId
LEFT JOIN Negotiation n ON nrf.NegotiationId = n.NegotiationId
LEFT JOIN Contract c ON n.PerformerId = c.PerformerId
WHERE r.ContractUpdateAction IS NOT NULL
  AND nrf.IsFulfilled = 1
GROUP BY r.ContractUpdateAction
ORDER BY RequirementsFulfilled DESC;

PROMPT;

-- ============================================================================
-- TEST 6: Data Quality and Validation
-- ============================================================================
PROMPT ====================================================================
PROMPT TEST 6: Data Quality Checks
PROMPT ====================================================================
PROMPT;

-- Check for orphaned records
PROMPT Checking for data integrity issues:
PROMPT;

PROMPT Negotiations without active phases:
SELECT n.NegotiationId, n.Status, COUNT(np.PhaseId) AS PhaseCount
FROM Negotiation n
LEFT JOIN NegotiationPhase np ON n.NegotiationId = np.NegotiationId
WHERE n.Status = 'InProgress'
GROUP BY n.NegotiationId, n.Status
HAVING COUNT(CASE WHEN np.IsActive = 1 THEN 1 END) = 0;

PROMPT;

PROMPT Negotiations with fulfillment rate = 0:
SELECT 
    n.NegotiationId,
    n.Status,
    (SELECT COUNT(*) FROM NegotiationRequirementFulfillment nrf 
     WHERE nrf.NegotiationId = n.NegotiationId) AS TotalRequirements,
    (SELECT SUM(CASE WHEN IsFulfilled = 1 THEN 1 ELSE 0 END)
     FROM NegotiationRequirementFulfillment nrf 
     WHERE nrf.NegotiationId = n.NegotiationId) AS FulfilledRequirements
FROM Negotiation n
WHERE n.Status IN ('InProgress', 'Pending')
  AND (SELECT SUM(CASE WHEN IsFulfilled = 1 THEN 1 ELSE 0 END)
       FROM NegotiationRequirementFulfillment nrf 
       WHERE nrf.NegotiationId = n.NegotiationId) = 0;

PROMPT;

-- ============================================================================
-- SUMMARY
-- ============================================================================
PROMPT ====================================================================
PROMPT TEST SUITE COMPLETED
PROMPT ====================================================================
PROMPT;
PROMPT All tests have been executed. Review the output above for results.
PROMPT;
PROMPT For interactive testing:
PROMPT 1. Use the trigger test commands shown in TEST 2
PROMPT 2. Modify data and observe trigger behavior
PROMPT 3. Compare execution times with/without indexes
PROMPT 4. Generate custom reports using the provided examples
PROMPT;
