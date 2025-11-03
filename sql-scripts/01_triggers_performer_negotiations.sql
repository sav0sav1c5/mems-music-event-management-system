-- ============================================================================
-- PL/SQL TRIGGERS FOR PERFORMER NEGOTIATIONS SUBSYSTEM
-- ============================================================================
-- Author: IIS Project Team
-- Date: October 13, 2025
-- Description: Two non-trivial triggers that enhance business logic for 
--              the performer negotiation system
-- ============================================================================

-- ============================================================================
-- TRIGGER 1: Auto-update Negotiation Status Based on Phase Progress
-- ============================================================================
-- Purpose: Automatically updates the Negotiation.Status field when all 
--          requirements in a phase are fulfilled, and advances the negotiation
--          to the next phase when appropriate.
-- Trigger Type: AFTER UPDATE on NegotiationRequirementFulfillment
-- Business Logic: 
--   - When a requirement is marked as fulfilled (IsFulfilled = 1)
--   - Check if ALL requirements in the current phase are now fulfilled
--   - If yes, mark the NegotiationPhase as 'Completed'
--   - Update Negotiation.Status to reflect progress
-- ============================================================================

CREATE OR REPLACE TRIGGER trg_update_negotiation_status
AFTER UPDATE OF IsFulfilled ON NegotiationRequirementFulfillment
FOR EACH ROW
WHEN (NEW.IsFulfilled = 1 AND OLD.IsFulfilled = 0) -- Only when newly fulfilled
DECLARE
    v_unfulfilled_count NUMBER;
    v_negotiation_id NUMBER;
    v_phase_id NUMBER;
    v_current_phase_order NUMBER;
    v_max_phase_order NUMBER;
BEGIN
    -- Store the IDs
    v_negotiation_id := :NEW.NegotiationId;
    v_phase_id := :NEW.PhaseId;
    
    -- Count unfulfilled requirements in the same negotiation and phase
    SELECT COUNT(*)
    INTO v_unfulfilled_count
    FROM NegotiationRequirementFulfillment nrf
    WHERE nrf.NegotiationId = v_negotiation_id
      AND nrf.PhaseId = v_phase_id
      AND nrf.IsFulfilled = 0;
    
    -- If all requirements are fulfilled (count = 0)
    IF v_unfulfilled_count = 0 THEN
        -- Mark the NegotiationPhase as Completed
        UPDATE NegotiationPhase
        SET Status = 'Completed',
            CompletedDate = SYSTIMESTAMP,
            IsActive = 0
        WHERE NegotiationId = v_negotiation_id
          AND PhaseId = v_phase_id;
        
        -- Get current phase order and max phase order
        SELECT p.OrderNumber
        INTO v_current_phase_order
        FROM Phase p
        WHERE p.PhaseId = v_phase_id;
        
        SELECT MAX(p.OrderNumber)
        INTO v_max_phase_order
        FROM NegotiationPhase np
        JOIN Phase p ON np.PhaseId = p.PhaseId
        WHERE np.NegotiationId = v_negotiation_id;
        
        -- Update negotiation status based on phase completion
        IF v_current_phase_order = v_max_phase_order THEN
            -- All phases completed - negotiation is successful
            UPDATE Negotiation
            SET Status = 'Completed',
                CurrentPhaseOrder = v_current_phase_order
            WHERE NegotiationId = v_negotiation_id;
            
            DBMS_OUTPUT.PUT_LINE('Negotiation ' || v_negotiation_id || ' completed successfully!');
        ELSE
            -- Move to next phase
            UPDATE Negotiation
            SET Status = 'InProgress',
                CurrentPhaseOrder = v_current_phase_order + 1
            WHERE NegotiationId = v_negotiation_id;
            
            -- Activate the next phase
            UPDATE NegotiationPhase np
            SET np.Status = 'InProgress',
                np.StartDate = SYSTIMESTAMP,
                np.IsActive = 1
            WHERE np.NegotiationId = v_negotiation_id
              AND np.PhaseId = (
                  SELECT p2.PhaseId 
                  FROM Phase p2 
                  WHERE p2.OrderNumber = v_current_phase_order + 1
                    AND EXISTS (
                        SELECT 1 FROM NegotiationPhase np2
                        WHERE np2.NegotiationId = v_negotiation_id
                          AND np2.PhaseId = p2.PhaseId
                    )
                  FETCH FIRST 1 ROW ONLY
              );
            
            DBMS_OUTPUT.PUT_LINE('Negotiation ' || v_negotiation_id || ' advanced to phase ' || (v_current_phase_order + 1));
        END IF;
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error in trg_update_negotiation_status: ' || SQLERRM);
        RAISE;
END;
/


-- ============================================================================
-- TRIGGER 2: Auto-update Contract Fields When Special Requirements Are Met
-- ============================================================================
-- Purpose: Automatically updates specific Contract fields when certain 
--          negotiation requirements are fulfilled. This implements the 
--          ContractUpdateAction mechanism.
-- Trigger Type: AFTER UPDATE on NegotiationRequirementFulfillment
-- Business Logic:
--   - When a requirement with a ContractUpdateAction is fulfilled
--   - Automatically update the corresponding contract field
--   - Supported actions: 'DEPOSIT_PAID', 'FINAL_PAYMENT_PAID', 
--                       'TECHNICAL_APPROVED', 'REVIEWED_BY_STAKEHOLDERS'
-- ============================================================================

CREATE OR REPLACE TRIGGER trg_update_contract_from_requirement
AFTER UPDATE OF IsFulfilled ON NegotiationRequirementFulfillment
FOR EACH ROW
WHEN (NEW.IsFulfilled = 1 AND OLD.IsFulfilled = 0) -- Only when newly fulfilled
DECLARE
    v_contract_update_action VARCHAR2(100);
    v_performer_id NUMBER;
    v_event_id NUMBER;
    v_contract_exists NUMBER;
BEGIN
    -- Get the ContractUpdateAction for this requirement
    SELECT r.ContractUpdateAction
    INTO v_contract_update_action
    FROM Requirement r
    WHERE r.RequirementId = :NEW.RequirementId;
    
    -- Only proceed if there is a contract update action defined
    IF v_contract_update_action IS NOT NULL THEN
        
        -- Get the PerformerId and EventId from the negotiation
        SELECT n.PerformerId, n.EventId
        INTO v_performer_id, v_event_id
        FROM Negotiation n
        WHERE n.NegotiationId = :NEW.NegotiationId;
        
        -- Check if a contract exists for this performer and event
        SELECT COUNT(*)
        INTO v_contract_exists
        FROM Contract c
        WHERE c.PerformerId = v_performer_id
          AND (c.EventId = v_event_id OR c.EventId IS NULL);
        
        -- Only update if contract exists
        IF v_contract_exists > 0 THEN
            -- Update the contract based on the action type
            CASE v_contract_update_action
                WHEN 'DEPOSIT_PAID' THEN
                    UPDATE Contract
                    SET IsDepositPaid = 1
                    WHERE PerformerId = v_performer_id
                      AND (EventId = v_event_id OR EventId IS NULL);
                    
                    DBMS_OUTPUT.PUT_LINE('Contract deposit marked as paid for Performer ' || v_performer_id);
                    
                WHEN 'FINAL_PAYMENT_PAID' THEN
                    UPDATE Contract
                    SET IsFinalPaymentPaid = 1
                    WHERE PerformerId = v_performer_id
                      AND (EventId = v_event_id OR EventId IS NULL);
                    
                    DBMS_OUTPUT.PUT_LINE('Contract final payment marked as paid for Performer ' || v_performer_id);
                    
                WHEN 'TECHNICAL_APPROVED' THEN
                    UPDATE Contract
                    SET TechnicalRequirements = 'APPROVED - ' || 
                        SUBSTR(TechnicalRequirements, 1, 3900) -- Keep first 3900 chars
                    WHERE PerformerId = v_performer_id
                      AND (EventId = v_event_id OR EventId IS NULL)
                      AND TechnicalRequirements NOT LIKE 'APPROVED%';
                    
                    DBMS_OUTPUT.PUT_LINE('Technical requirements approved for Performer ' || v_performer_id);
                    
                WHEN 'REVIEWED_BY_STAKEHOLDERS' THEN
                    UPDATE Contract
                    SET ReviewedByStakeholders = 1,
                        StakeholderReviewDate = SYSTIMESTAMP
                    WHERE PerformerId = v_performer_id
                      AND (EventId = v_event_id OR EventId IS NULL);
                    
                    DBMS_OUTPUT.PUT_LINE('Contract reviewed by stakeholders for Performer ' || v_performer_id);
                    
                WHEN 'CONTRACT_SIGNED' THEN
                    UPDATE Contract
                    SET Status = 'Active',
                        SignedAt = SYSTIMESTAMP
                    WHERE PerformerId = v_performer_id
                      AND (EventId = v_event_id OR EventId IS NULL)
                      AND SignedAt IS NULL;
                    
                    DBMS_OUTPUT.PUT_LINE('Contract signed for Performer ' || v_performer_id);
                    
                ELSE
                    DBMS_OUTPUT.PUT_LINE('Unknown contract update action: ' || v_contract_update_action);
            END CASE;
        END IF;
    END IF;
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        -- Requirement or Negotiation might not exist, which is acceptable
        NULL;
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error in trg_update_contract_from_requirement: ' || SQLERRM);
        RAISE;
END;
/

-- ============================================================================
-- END OF TRIGGERS
-- ============================================================================

-- Enable server output to see trigger messages
SET SERVEROUTPUT ON;

-- Verification message
SELECT 'Triggers created successfully!' AS Status FROM DUAL;
