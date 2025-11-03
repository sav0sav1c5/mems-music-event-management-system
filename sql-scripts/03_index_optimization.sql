-- ============================================================================
-- SQL INDEX OPTIMIZATION FOR PERFORMER NEGOTIATIONS SUBSYSTEM
-- ============================================================================
-- Author: IIS Project Team
-- Date: October 13, 2025
-- Description: Performance optimization through strategic indexing for a
--              complex negotiation query involving multiple JOINs and filters
-- ============================================================================

-- ============================================================================
-- BASELINE QUERY: Find Active Negotiations with Unfulfilled Requirements
-- ============================================================================
-- This query is commonly used in the system to identify negotiations that
-- need attention. It joins multiple tables and filters by status and dates.
-- ============================================================================

-- ============================================================================
-- STEP 1: BASELINE PERFORMANCE MEASUREMENT (BEFORE INDEXING)
-- ============================================================================

-- Enable timing statistics
SET TIMING ON;
SET AUTOTRACE ON EXPLAIN;

-- Baseline query without indexes
SELECT 
    n.NegotiationId,
    n.Status AS NegotiationStatus,
    n.ProposedFee,
    p.Name AS PerformerName,
    p.Genre AS PerformerGenre,
    e.Name AS EventName,
    e.Interval AS EventDate,
    ph.PhaseName,
    ph.OrderNumber AS PhaseOrder,
    COUNT(nrf.FulfillmentId) AS TotalRequirements,
    SUM(CASE WHEN nrf.IsFulfilled = 1 THEN 1 ELSE 0 END) AS FulfilledRequirements,
    COUNT(nrf.FulfillmentId) - SUM(CASE WHEN nrf.IsFulfilled = 1 THEN 1 ELSE 0 END) AS PendingRequirements
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
    n.ProposedFee,
    p.Name,
    p.Genre,
    e.Name,
    e.Interval,
    ph.PhaseName,
    ph.OrderNumber
HAVING COUNT(nrf.FulfillmentId) - SUM(CASE WHEN nrf.IsFulfilled = 1 THEN 1 ELSE 0 END) > 0
ORDER BY e.Interval ASC, PendingRequirements DESC;

-- View execution plan BEFORE optimization
EXPLAIN PLAN FOR
SELECT 
    n.NegotiationId,
    n.Status AS NegotiationStatus,
    p.Name AS PerformerName,
    e.Name AS EventName,
    COUNT(nrf.FulfillmentId) AS TotalRequirements
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
GROUP BY n.NegotiationId, n.Status, p.Name, e.Name;

SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY());

-- ============================================================================
-- STEP 2: INDEX CREATION STRATEGY
-- ============================================================================
-- Analysis of the query reveals several optimization opportunities:
--
-- 1. Negotiation.Status - Frequently filtered in WHERE clause
-- 2. Event.Interval - Used for date range filtering and sorting
-- 3. NegotiationPhase.IsActive - Boolean filter (very selective)
-- 4. NegotiationRequirementFulfillment compound key - Used in JOINs
-- 5. Foreign keys - Used extensively in JOIN operations
--
-- Index Selection Rationale:
-- - Composite indexes for multi-column filters
-- - Covering indexes where possible to avoid table access
-- - Foreign key indexes to speed up JOIN operations
-- ============================================================================

-- INDEX 1: Negotiation Status Filter
-- Rationale: The WHERE clause filters by Status frequently. This index
-- allows quick location of active negotiations without full table scan.
CREATE INDEX idx_negotiation_status 
ON Negotiation(Status);

COMMENT ON INDEX idx_negotiation_status IS 
'Optimizes queries filtering negotiations by status (InProgress, Pending, Completed)';

-- INDEX 2: Event Date Range Queries
-- Rationale: Queries often filter by future events (Interval >= SYSDATE)
-- and sort by event date. This index supports both operations.
CREATE INDEX idx_event_interval 
ON Event(Interval);

COMMENT ON INDEX idx_event_interval IS 
'Supports date range filtering and sorting by event date';

-- INDEX 3: Composite Index for Negotiation Filtering
-- Rationale: Combines Status and EventId for highly selective queries.
-- Covers the most common query pattern: active negotiations for specific events.
CREATE INDEX idx_negotiation_status_event 
ON Negotiation(Status, EventId);

COMMENT ON INDEX idx_negotiation_status_event IS 
'Composite index for status + event filtering, avoids table access in some queries';

-- INDEX 4: NegotiationPhase Active Status
-- Rationale: IsActive is highly selective (typically only 1 active phase
-- per negotiation). This index dramatically reduces rows to scan.
CREATE INDEX idx_negotiation_phase_active 
ON NegotiationPhase(IsActive, NegotiationId);

COMMENT ON INDEX idx_negotiation_phase_active IS 
'Quickly finds active phases for negotiations, very high selectivity';

-- INDEX 5: Composite Index for Requirement Fulfillment Lookups
-- Rationale: The LEFT JOIN uses NegotiationId and PhaseId together.
-- This composite index makes the join operation much more efficient.
CREATE INDEX idx_req_fulfillment_negotiation_phase 
ON NegotiationRequirementFulfillment(NegotiationId, PhaseId, IsFulfilled);

COMMENT ON INDEX idx_req_fulfillment_negotiation_phase IS 
'Optimizes requirement fulfillment joins and allows index-only scans for counts';

-- INDEX 6: Foreign Key Index - Negotiation to Performer
-- Rationale: JOIN to Performer table is always used. This index speeds up
-- the join operation significantly.
CREATE INDEX idx_negotiation_performer_fk 
ON Negotiation(PerformerId);

COMMENT ON INDEX idx_negotiation_performer_fk IS 
'Speeds up joins between Negotiation and Performer tables';

-- INDEX 7: Foreign Key Index - Negotiation to Event
-- Rationale: Similar to above, this JOIN is critical and frequent.
CREATE INDEX idx_negotiation_event_fk 
ON Negotiation(EventId);

COMMENT ON INDEX idx_negotiation_event_fk IS 
'Speeds up joins between Negotiation and Event tables';

-- ============================================================================
-- STEP 3: GATHER STATISTICS AFTER INDEX CREATION
-- ============================================================================
-- Oracle's optimizer needs current statistics to choose the best execution plan
-- ============================================================================

BEGIN
    DBMS_STATS.GATHER_TABLE_STATS(
        ownname => USER,
        tabname => 'NEGOTIATION',
        cascade => TRUE
    );
    
    DBMS_STATS.GATHER_TABLE_STATS(
        ownname => USER,
        tabname => 'EVENT',
        cascade => TRUE
    );
    
    DBMS_STATS.GATHER_TABLE_STATS(
        ownname => USER,
        tabname => 'NEGOTIATIONPHASE',
        cascade => TRUE
    );
    
    DBMS_STATS.GATHER_TABLE_STATS(
        ownname => USER,
        tabname => 'NEGOTIATIONREQUIREMENTFULFILLMENT',
        cascade => TRUE
    );
    
    DBMS_OUTPUT.PUT_LINE('Statistics gathered successfully for all tables');
END;
/

-- ============================================================================
-- STEP 4: PERFORMANCE MEASUREMENT AFTER INDEXING
-- ============================================================================

-- Re-run the same query with indexes in place
SELECT 
    n.NegotiationId,
    n.Status AS NegotiationStatus,
    n.ProposedFee,
    p.Name AS PerformerName,
    p.Genre AS PerformerGenre,
    e.Name AS EventName,
    e.Interval AS EventDate,
    ph.PhaseName,
    ph.OrderNumber AS PhaseOrder,
    COUNT(nrf.FulfillmentId) AS TotalRequirements,
    SUM(CASE WHEN nrf.IsFulfilled = 1 THEN 1 ELSE 0 END) AS FulfilledRequirements,
    COUNT(nrf.FulfillmentId) - SUM(CASE WHEN nrf.IsFulfilled = 1 THEN 1 ELSE 0 END) AS PendingRequirements
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
    n.ProposedFee,
    p.Name,
    p.Genre,
    e.Name,
    e.Interval,
    ph.PhaseName,
    ph.OrderNumber
HAVING COUNT(nrf.FulfillmentId) - SUM(CASE WHEN nrf.IsFulfilled = 1 THEN 1 ELSE 0 END) > 0
ORDER BY e.Interval ASC, PendingRequirements DESC;

-- View execution plan AFTER optimization
EXPLAIN PLAN FOR
SELECT 
    n.NegotiationId,
    n.Status AS NegotiationStatus,
    p.Name AS PerformerName,
    e.Name AS EventName,
    COUNT(nrf.FulfillmentId) AS TotalRequirements
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
GROUP BY n.NegotiationId, n.Status, p.Name, e.Name;

SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY());

-- ============================================================================
-- STEP 5: PERFORMANCE COMPARISON ANALYSIS
-- ============================================================================

SELECT 
    'PERFORMANCE ANALYSIS' AS Report,
    '===================' AS Separator
FROM DUAL;

-- Show index usage statistics
SELECT 
    index_name,
    table_name,
    uniqueness,
    status,
    num_rows,
    distinct_keys,
    clustering_factor
FROM user_indexes
WHERE table_name IN ('NEGOTIATION', 'EVENT', 'NEGOTIATIONPHASE', 'NEGOTIATIONREQUIREMENTFULFILLMENT')
ORDER BY table_name, index_name;

-- ============================================================================
-- EXPECTED IMPROVEMENTS:
-- ============================================================================
-- BEFORE INDEXING:
-- - Full table scans on Negotiation, Event, and NegotiationPhase
-- - Hash joins for all table combinations
-- - Estimated cost: 500-2000 (depending on data volume)
-- - Execution time: 200-1000ms for moderate data volumes
--
-- AFTER INDEXING:
-- - Index range scans replace full table scans
-- - Nested loop joins can be used for selective queries
-- - Estimated cost reduction: 60-80%
-- - Execution time reduction: 70-90%
-- - Example: 500ms -> 50-150ms
--
-- KEY BENEFITS:
-- 1. idx_negotiation_status eliminates full scan for status filtering
-- 2. idx_event_interval speeds up date range queries by 10-20x
-- 3. idx_negotiation_phase_active provides dramatic selectivity (90%+ reduction)
-- 4. idx_req_fulfillment_negotiation_phase enables index-only scans for counts
-- 5. Foreign key indexes speed up all JOIN operations
-- ============================================================================

SET TIMING OFF;
SET AUTOTRACE OFF;

-- ============================================================================
-- MAINTENANCE RECOMMENDATION
-- ============================================================================

COMMENT ON TABLE Negotiation IS 
'Regularly monitor index usage and rebuild indexes when fragmentation > 20%';

-- Script to check index health (run monthly)
SELECT 
    index_name,
    blevel AS "B-Tree Levels",
    leaf_blocks,
    clustering_factor,
    num_rows,
    ROUND(clustering_factor / NULLIF(num_rows, 0) * 100, 2) AS "Clustering %"
FROM user_indexes
WHERE table_name = 'NEGOTIATION'
ORDER BY index_name;

-- ============================================================================
-- END OF INDEX OPTIMIZATION
-- ============================================================================

SELECT 'Index optimization completed successfully!' AS Status FROM DUAL;
