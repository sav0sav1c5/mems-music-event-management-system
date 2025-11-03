using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Services;
using MusicEventManagementSystem.API.Services.IService;
using MusicEventManagementSystem.API.DTOs;
using System;

namespace MusicEventManagementSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NegotiationController : ControllerBase
    {
        private readonly INegotiationService _negotiationService;

        public NegotiationController(INegotiationService negotiationService)
        {
            _negotiationService = negotiationService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<NegotiationDto>>> GetAllNegotiations()
        {
            try
            {
                var negotiations = await _negotiationService.GetNegotiationsWithBasicDetailsAsync();
                return Ok(negotiations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Negotiation>> GetNegotiationById(int id)
        {
            try
            {
                var existingNegotiation = await _negotiationService.GetNegotiationByIdAsync(id);

                if (existingNegotiation == null)
                {
                    return NotFound($"Negotiation with ID {id} not found.");
                }

                return Ok(existingNegotiation);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}/details")]
        public async Task<ActionResult<NegotiationWithDetailsDto>> GetNegotiationWithDetails(int id)
        {
            try
            {
                var negotiation = await _negotiationService.GetNegotiationWithDetailsAsync(id);

                if (negotiation == null)
                {
                    return NotFound($"Negotiation with ID {id} not found.");
                }

                return Ok(negotiation);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("by-event/{eventId}")]
        public async Task<ActionResult<IEnumerable<NegotiationDto>>> GetNegotiationsByEventId(int eventId)
        {
            try
            {
                var negotiations = await _negotiationService.GetNegotiationsByEventIdAsync(eventId);
                return Ok(negotiations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("by-performer/{performerId}")]
        public async Task<ActionResult<IEnumerable<NegotiationDto>>> GetNegotiationsByPerformerId(int performerId)
        {
            try
            {
                var negotiations = await _negotiationService.GetNegotiationsByPerformerIdAsync(performerId);
                return Ok(negotiations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Negotiation>> CreateNegotiation([FromBody] CreateNegotiationDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdNegotiation = await _negotiationService.CreateNegotiationWithRelationshipsAsync(createDto);

                return CreatedAtAction(nameof(GetNegotiationById), new { id = createdNegotiation.NegotiationId }, createdNegotiation);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Negotiation>> UpdateNegotiation(int id, [FromBody] UpdateNegotiationDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedNegotiation = await _negotiationService.UpdateNegotiationWithRelationshipsAsync(id, updateDto);

                if (updatedNegotiation == null)
                {
                    return NotFound($"Negotiation with ID {id} not found.");
                }

                return Ok(updatedNegotiation);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("{id}/users/{userId}")]
        public async Task<ActionResult> AddUserToNegotiation(int id, string userId)
        {
            try
            {
                var result = await _negotiationService.AddUserToNegotiationAsync(id, userId);
                
                if (!result)
                {
                    return BadRequest("User is already associated with this negotiation or negotiation not found.");
                }

                return Ok("User successfully added to negotiation.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}/users/{userId}")]
        public async Task<ActionResult> RemoveUserFromNegotiation(int id, string userId)
        {
            try
            {
                var result = await _negotiationService.RemoveUserFromNegotiationAsync(id, userId);
                
                if (!result)
                {
                    return NotFound("User association with negotiation not found.");
                }

                return Ok("User successfully removed from negotiation.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteNegotiation(int id)
        {
            try
            {
                var isDeleted = await _negotiationService.DeleteNegotiationAsync(id);

                if (isDeleted == false)
                {
                    return NotFound($"Negotiation with ID {id} not found.");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        #region Phase Management Methods

        [HttpGet("{id}/current-phase-order")]
        public async Task<ActionResult<int>> GetCurrentPhaseOrder(int id)
        {
            try
            {
                var currentPhaseOrder = await _negotiationService.GetCurrentPhaseOrderAsync(id);
                return Ok(new { negotiationId = id, currentPhaseOrder = currentPhaseOrder });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("{id}/advance-phase")]
        public async Task<ActionResult> AdvanceNegotiationPhase(int id)
        {
            try
            {
                var advanced = await _negotiationService.AdvanceNegotiationPhaseAsync(id);
                if (!advanced)
                {
                    return BadRequest(new { message = "Cannot advance phase. Requirements may not be fulfilled or already at final phase." });
                }

                return Ok(new { message = $"Successfully advanced negotiation {id} to next phase." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}/phase-order")]
        public async Task<ActionResult> UpdateNegotiationPhaseOrder(int id, [FromBody] int newPhaseOrder)
        {
            try
            {
                var updated = await _negotiationService.UpdateNegotiationPhaseOrderAsync(id, newPhaseOrder);
                if (!updated)
                {
                    return NotFound($"Negotiation with ID {id} not found.");
                }

                return Ok(new { message = $"Updated negotiation {id} to phase order {newPhaseOrder}." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}/current-phase")]
        public async Task<ActionResult<NegotiationPhase>> GetCurrentPhase(int id)
        {
            try
            {
                var currentPhase = await _negotiationService.GetCurrentPhaseAsync(id);
                if (currentPhase == null)
                {
                    return NotFound($"No current phase found for negotiation {id}.");
                }

                return Ok(currentPhase);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}/phase-history")]
        public async Task<ActionResult<IEnumerable<NegotiationPhase>>> GetNegotiationPhaseHistory(int id)
        {
            try
            {
                var phaseHistory = await _negotiationService.GetNegotiationPhaseHistoryAsync(id);
                return Ok(phaseHistory);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        #endregion

        #region Requirement Fulfillment Methods

        [HttpGet("{id}/requirements")]
        public async Task<ActionResult<IEnumerable<NegotiationRequirementFulfillment>>> GetNegotiationRequirements(int id)
        {
            try
            {
                var requirements = await _negotiationService.GetNegotiationRequirementsAsync(id);
                return Ok(requirements);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("{id}/requirements/{requirementId}/fulfill")]
        public async Task<ActionResult> FulfillRequirement(int id, int requirementId, [FromQuery] bool isFulfilled = true)
        {
            try
            {
                var fulfilled = await _negotiationService.FulfillRequirementAsync(id, requirementId, isFulfilled);
                if (!fulfilled)
                {
                    return BadRequest(new { message = "Failed to update requirement fulfillment." });
                }

                var status = isFulfilled ? "fulfilled" : "unfulfilled";
                return Ok(new { message = $"Requirement {requirementId} marked as {status} for negotiation {id}." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}/phase/{phaseId}/requirements-fulfilled")]
        public async Task<ActionResult<bool>> AreAllRequirementsFulfilledForPhase(int id, int phaseId)
        {
            try
            {
                var allFulfilled = await _negotiationService.AreAllRequirementsFulfilledForPhaseAsync(id, phaseId);
                return Ok(new { negotiationId = id, phaseId = phaseId, allRequirementsFulfilled = allFulfilled });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}/phase/{phaseId}/completion-percentage")]
        public async Task<ActionResult<decimal>> GetPhaseCompletionPercentage(int id, int phaseId)
        {
            try
            {
                var percentage = await _negotiationService.GetPhaseCompletionPercentageAsync(id, phaseId);
                return Ok(new { negotiationId = id, phaseId = phaseId, completionPercentage = percentage });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        #endregion

        #region Enhanced Workflow Methods

        [HttpGet("{id}/workflow")]
        public async Task<ActionResult<NegotiationWorkflowDto>> GetNegotiationWorkflow(int id)
        {
            try
            {
                var workflow = await _negotiationService.GetNegotiationWorkflowAsync(id);
                if (workflow == null)
                {
                    return NotFound($"Negotiation with ID {id} not found.");
                }

                // Debug logging
                Console.WriteLine($"DEBUG: Workflow for negotiation {id}:");
                Console.WriteLine($"  - Current Phase: {workflow.CurrentPhase?.PhaseName ?? "NULL"}");
                Console.WriteLine($"  - Total Phases: {workflow.Phases.Count}");
                foreach (var phase in workflow.Phases.OrderBy(p => p.OrderNumber))
                {
                    Console.WriteLine($"  - Phase {phase.OrderNumber}: {phase.PhaseName} | Active: {phase.IsActive} | Status: {phase.Status}");
                }

                return Ok(workflow);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}/requirements/phase/{phaseId}")]
        public async Task<ActionResult<IEnumerable<NegotiationRequirementFulfillmentDto>>> GetRequirementsByPhase(int id, int phaseId)
        {
            try
            {
                var requirements = await _negotiationService.GetNegotiationRequirementsByPhaseAsync(id, phaseId);
                var requirementDtos = requirements.Select(r => new NegotiationRequirementFulfillmentDto
                {
                    FulfillmentId = r.FulfillmentId,
                    NegotiationId = r.NegotiationId,
                    PhaseId = r.PhaseId,
                    RequirementId = r.RequirementId,
                    RequirementTitle = r.Requirement.Title,
                    RequirementDescription = r.Requirement.Description,
                    IsRequired = r.Requirement.IsRequired,
                    IsFulfilled = r.IsFulfilled,
                    Evidence = r.Evidence,
                    Notes = r.Notes,
                    FulfilledDate = r.FulfilledDate,
                    FulfilledBy = r.FulfilledBy
                });

                return Ok(requirementDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}/requirements/{requirementId}/fulfill")]
        public async Task<ActionResult> FulfillRequirement(int id, int requirementId, [FromBody] FulfillRequirementDto fulfillDto)
        {
            try
            {
                var result = await _negotiationService.FulfillRequirementAsync(
                    id, 
                    requirementId, 
                    fulfillDto.IsFulfilled, 
                    fulfillDto.FulfilledBy, 
                    fulfillDto.Notes, 
                    fulfillDto.Evidence
                );

                if (!result)
                {
                    return BadRequest(new { message = "Failed to update requirement fulfillment." });
                }

                var status = fulfillDto.IsFulfilled ? "fulfilled" : "unfulfilled";
                return Ok(new { message = $"Requirement {requirementId} marked as {status} for negotiation {id}." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("{id}/communications")]
        public async Task<ActionResult> AddCommunication(int id, [FromBody] AddCommunicationDto communicationDto)
        {
            try
            {
                var result = await _negotiationService.AddCommunicationToNegotiationAsync(
                    id, 
                    communicationDto.Type, 
                    communicationDto.Direction, 
                    communicationDto.Content
                );

                if (!result)
                {
                    return BadRequest(new { message = "Failed to add communication." });
                }

                return Ok(new { message = "Communication added successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}/communications")]
        public async Task<ActionResult<CommunicationDto>> GetNegotiationCommunication(int id)
        {
            try
            {
                var communication = await _negotiationService.GetNegotiationCommunicationAsync(id);
                if (communication == null)
                {
                    return NotFound($"No communication found for negotiation {id}.");
                }

                var communicationDto = new CommunicationDto
                {
                    CommunicationId = communication.CommunicationId,
                    Type = communication.Type,
                    Direction = communication.Direction,
                    Content = communication.Content,
                    SentAt = communication.SentAt,
                    RepliedAt = communication.RepliedAt,
                    NegotiationId = communication.NegotiationId
                };

                return Ok(communicationDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}/can-advance")]
        public async Task<ActionResult<bool>> CanAdvanceToNextPhase(int id)
        {
            try
            {
                var canAdvance = await _negotiationService.CanAdvanceToNextPhaseAsync(id);
                return Ok(new { negotiationId = id, canAdvanceToNextPhase = canAdvance });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("{id}/complete")]
        public async Task<ActionResult> CompleteNegotiation(int id)
        {
            try
            {
                var result = await _negotiationService.CompleteNegotiationAsync(id);
                if (!result)
                {
                    return BadRequest(new { message = "Cannot complete negotiation. Not all phases may be completed." });
                }

                return Ok(new { message = $"Negotiation {id} completed successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // TEMPORARY DEBUG ENDPOINT - REMOVE IN PRODUCTION
        [HttpPost("debug/fix-active-phases")]
        public async Task<ActionResult> FixActivePhases()
        {
            try
            {
                var result = await _negotiationService.FixActivePhases();
                return Ok(new { message = "Active phases fixed", affectedNegotiations = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        #endregion

        #region Analytics Endpoints

        [HttpGet("analytics/summary")]
        public async Task<ActionResult> GetAnalyticsSummary([FromQuery] string timeRange = "30d")
        {
            try
            {
                var summary = await _negotiationService.GetAnalyticsSummaryAsync(timeRange);
                return Ok(summary);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("analytics/phase-distribution")]
        public async Task<ActionResult> GetPhaseDistribution([FromQuery] string timeRange = "30d")
        {
            try
            {
                var distribution = await _negotiationService.GetPhaseDistributionAsync(timeRange);
                return Ok(distribution);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("analytics/trends")]
        public async Task<ActionResult> GetNegotiationTrends([FromQuery] string timeRange = "30d")
        {
            try
            {
                var trends = await _negotiationService.GetNegotiationTrendsAsync(timeRange);
                return Ok(trends);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("analytics/performer-analytics")]
        public async Task<ActionResult> GetPerformerAnalytics([FromQuery] string timeRange = "30d")
        {
            try
            {
                var analytics = await _negotiationService.GetPerformerAnalyticsAsync(timeRange);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("analytics/revenue-by-event")]
        public async Task<ActionResult> GetRevenueByEvent([FromQuery] string timeRange = "30d")
        {
            try
            {
                var revenue = await _negotiationService.GetRevenueByEventAsync(timeRange);
                return Ok(revenue);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("analytics/phase-duration")]
        public async Task<ActionResult> GetPhaseDurationAnalysis([FromQuery] string timeRange = "30d")
        {
            try
            {
                var duration = await _negotiationService.GetPhaseDurationAnalysisAsync(timeRange);
                return Ok(duration);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("analytics/recent-activity")]
        public async Task<ActionResult> GetRecentActivity([FromQuery] int limit = 10)
        {
            try
            {
                var activity = await _negotiationService.GetRecentActivityAsync(limit);
                return Ok(activity);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        #endregion
    }
}
