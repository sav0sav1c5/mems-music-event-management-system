-- ============================================================================
-- QUICK START GUIDE - Execute All PL/SQL Scripts
-- ============================================================================
-- This master script executes all four PL/SQL scripts in the correct order
-- Run this in Oracle SQL Developer or SQL*Plus
-- ============================================================================

-- Enable output and set display preferences
SET SERVEROUTPUT ON SIZE UNLIMITED;
SET LINESIZE 200;
SET PAGESIZE 100;
SET TIMING ON;
SET ECHO ON;

-- ============================================================================
-- STEP 1: Create the PL/SQL Function
-- ============================================================================
PROMPT ====================================================================
PROMPT STEP 1: Creating PL/SQL Function for Complexity Calculation
PROMPT ====================================================================
@@02_function_negotiation_complexity.sql
PROMPT Function created successfully!
PROMPT;

-- ============================================================================
-- STEP 2: Create PL/SQL Triggers
-- ============================================================================
PROMPT ====================================================================
PROMPT STEP 2: Creating PL/SQL Triggers for Business Logic Automation
PROMPT ====================================================================
@@01_triggers_performer_negotiations.sql
PROMPT Triggers created successfully!
PROMPT;

-- ============================================================================
-- STEP 3: Optimize Database with Indexes
-- ============================================================================
PROMPT ====================================================================
PROMPT STEP 3: Creating Indexes for Query Optimization
PROMPT ====================================================================
PROMPT NOTE: This will run EXPLAIN PLAN and show before/after performance
@@03_index_optimization.sql
PROMPT Index optimization completed!
PROMPT;

-- ============================================================================
-- STEP 4: Generate Complex Report
-- ============================================================================
PROMPT ====================================================================
PROMPT STEP 4: Generating Performer Negotiation Analysis Report
PROMPT ====================================================================
@@04_complex_report.sql
PROMPT Report generation completed!
PROMPT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
PROMPT ====================================================================
PROMPT VERIFICATION: Checking Created Objects
PROMPT ====================================================================

-- Check functions
SELECT 'FUNCTION' AS ObjectType, object_name, status
FROM user_objects
WHERE object_type = 'FUNCTION'
  AND object_name LIKE 'FN_%'
UNION ALL
-- Check triggers
SELECT 'TRIGGER' AS ObjectType, object_name, status
FROM user_objects
WHERE object_type = 'TRIGGER'
  AND object_name LIKE 'TRG_%'
UNION ALL
-- Check procedures
SELECT 'PROCEDURE' AS ObjectType, object_name, status
FROM user_objects
WHERE object_type = 'PROCEDURE'
  AND object_name LIKE 'SP_%'
UNION ALL
-- Check types
SELECT 'TYPE' AS ObjectType, object_name, 'VALID' AS status
FROM user_types
WHERE type_name LIKE 'T_%'
ORDER BY ObjectType, object_name;

-- Check indexes
PROMPT;
PROMPT Created Indexes:
SELECT index_name, table_name, uniqueness, status
FROM user_indexes
WHERE index_name LIKE 'IDX_%'
ORDER BY table_name, index_name;

PROMPT;
PROMPT ====================================================================
PROMPT ALL SCRIPTS EXECUTED SUCCESSFULLY!
PROMPT ====================================================================
PROMPT;
PROMPT Next Steps:
PROMPT 1. Review the report output above
PROMPT 2. Test triggers by updating NegotiationRequirementFulfillment
PROMPT 3. Test function with: SELECT fn_calculate_negotiation_complexity(1) FROM DUAL;
PROMPT 4. Check index usage in your queries
PROMPT;

SET TIMING OFF;
SET ECHO OFF;
