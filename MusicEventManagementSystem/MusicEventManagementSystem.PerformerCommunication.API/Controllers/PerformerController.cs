using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication;

namespace MusicEventManagementSystem.PerformerCommunication.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PerformerController : ControllerBase
    {
        private readonly IPerformerService _performerService;

        public PerformerController(IPerformerService performerService)
        {
            _performerService = performerService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PerformerDto>>> GetAllPerformers()
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
        public async Task<ActionResult<PerformerDto>> GetPerformerById(int id)
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
        public async Task<ActionResult<PerformerDto>> CreatePerformer([FromBody] PerformerDto performer)
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
        public async Task<ActionResult<PerformerDto>> UpdatePerformer(int id, [FromBody] PerformerDto performer)
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

                if (isDeleted == false)
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
