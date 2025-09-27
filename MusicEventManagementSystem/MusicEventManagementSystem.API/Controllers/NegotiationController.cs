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
    }
}
