using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication;

namespace MusicEventManagementSystem.PerformerCommunication.API.Controllers
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
    }
}
