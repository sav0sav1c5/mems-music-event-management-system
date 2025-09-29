using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication;

namespace MusicEventManagementSystem.PerformerCommunication.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PhaseController : ControllerBase
    {
        private readonly IPhaseService _phaseService;

        public PhaseController(IPhaseService phaseService)
        {
            _phaseService = phaseService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Phase>>> GetAllPhases()
        {
            try
            {
                var phases = await _phaseService.GetAllPhasesAsync();
                return Ok(phases);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Phase>> GetPhaseById(int id)
        {
            try
            {
                var existingPhase = await _phaseService.GetPhaseByIdAsync(id);

                if (existingPhase == null)
                {
                    return NotFound($"Phase with ID {id} not found.");
                }

                return Ok(existingPhase);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Phase>> CreatePhase([FromBody] Phase phase)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdPhase = await _phaseService.CreatePhaseAsync(phase);

                return CreatedAtAction(nameof(GetPhaseById), new { id = createdPhase.PhaseId }, createdPhase);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Phase>> UpdatePhase(int id, [FromBody] Phase phase)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedPhase = await _phaseService.UpdatePhaseAsync(id, phase);

                if (updatedPhase == null)
                {
                    return NotFound($"Phase with ID {id} not found.");
                }

                return Ok(updatedPhase);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeletePhase(int id)
        {
            try
            {
                var isDeleted = await _phaseService.DeletePhaseAsync(id);

                if (isDeleted == false)
                {
                    return NotFound($"Phase with ID {id} not found.");
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
