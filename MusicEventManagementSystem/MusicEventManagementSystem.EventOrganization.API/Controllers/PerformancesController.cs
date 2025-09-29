using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.EventOrganization.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PerformancesController : ControllerBase
    {
        private readonly IPerformanceService _performanceService;

        public PerformancesController(IPerformanceService performanceService)
        {
            _performanceService = performanceService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Performance>>> GetAllPerformances()
        {
            try
            {
                var performances = await _performanceService.GetAllPerformancesAsync();
                return Ok(performances);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Performance>> GetPerformanceById(int id)
        {
            try
            {
                var existingPerformance = await _performanceService.GetPerformanceByIdAsync(id);
                if (existingPerformance == null)
                {
                    return NotFound($"Performance with ID {id} not found.");
                }
                return Ok(existingPerformance);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Performance>> CreatePerformance([FromBody] Performance performance)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdPerformance = await _performanceService.CreatePerformanceAsync(performance);
                return CreatedAtAction(nameof(GetPerformanceById), new { id = createdPerformance.Id }, createdPerformance);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Performance>> UpdatePerformance(int id, [FromBody] Performance performance)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedPerformance = await _performanceService.UpdatePerformanceAsync(id, performance);
                if (updatedPerformance == null)
                {
                    return NotFound($"Performance with ID {id} not found.");
                }
                return Ok(updatedPerformance);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeletePerformance(int id)
        {
            try
            {
                var isDeleted = await _performanceService.DeletePerformanceAsync(id);
                if (!isDeleted)
                {
                    return NotFound($"Performance with ID {id} not found.");
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