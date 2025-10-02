using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication;

namespace MusicEventManagementSystem.PerformerCommunication.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommunicationController : ControllerBase
    {
        private readonly ICommunicationService _communicationService;

        public CommunicationController(ICommunicationService communicationService)
        {
            _communicationService = communicationService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Communication>>> GetAllCommunications()
        {
            try
            {
                var communications = await _communicationService.GetAllCommunicationsAsync();
                return Ok(communications);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Communication>> GetCommunicationById(int id)
        {
            try
            {
                var existingCommunication = await _communicationService.GetCommunicationByIdAsync(id);

                if (existingCommunication == null)
                {
                    return NotFound($"Communication with ID {id} not found.");
                }

                return Ok(existingCommunication);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Communication>> CreateCommunication([FromBody] Communication communication)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdCommunication = await _communicationService.CreateCommunicationAsync(communication);

                return CreatedAtAction(nameof(GetCommunicationById), new { id = createdCommunication.CommunicationId }, createdCommunication);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Communication>> UpdateCommunication(int id, [FromBody] Communication communication)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedCommunication = await _communicationService.UpdateCommunicationAsync(id, communication);

                if (updatedCommunication == null)
                {
                    return NotFound($"Communication with ID {id} not found.");
                }

                return Ok(updatedCommunication);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteCommunication(int id)
        {
            try
            {
                var isDeleted = await _communicationService.DeleteCommunicationAsync(id);

                if (isDeleted == false)
                {
                    return NotFound($"Communication with ID {id} not found.");
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
