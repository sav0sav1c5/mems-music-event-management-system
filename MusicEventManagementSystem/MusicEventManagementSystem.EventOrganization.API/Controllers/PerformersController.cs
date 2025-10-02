using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;
using MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication;

namespace MusicEventManagementSystem.EventOrganization.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PerformersController : ControllerBase
    {
        private readonly IPerformerService _performerService;

        public PerformersController(IPerformerService performerService)
        {
            _performerService = performerService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PerformerResponseDto>>> GetAllPerformers()
        {
            try
            {
                var performers = await _performerService.GetAllPerformersAsync();
                return Ok(performers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PerformerResponseDto>> GetPerformerById(int id)
        {
            try
            {
                var existingPerformer = await _performerService.GetPerformerByIdAsync(id);
                if (existingPerformer == null)
                {
                    return NotFound($"Performer with ID {id} not found.");
                }
                return Ok(existingPerformer);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<PerformerResponseDto>> CreatePerformer([FromBody] CreatePerformerDto performer)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdPerformer = await _performerService.CreatePerformerAsync(performer);
                return CreatedAtAction(nameof(GetPerformerById), new { id = createdPerformer.PerformerId }, createdPerformer);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<PerformerResponseDto>> UpdatePerformer(int id, [FromBody] UpdatePerformerDto performer)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedPerformer = await _performerService.UpdatePerformerAsync(id, performer);
                if (updatedPerformer == null)
                {
                    return NotFound($"Performer with ID {id} not found.");
                }
                return Ok(updatedPerformer);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeletePerformer(int id)
        {
            try
            {
                var isDeleted = await _performerService.DeletePerformerAsync(id);
                if (!isDeleted)
                {
                    return NotFound($"Performer with ID {id} not found.");
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