using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.DTOs.EventOrganization;

namespace MusicEventManagementSystem.EventOrganization.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PerformanceController : ControllerBase
    {
        private readonly IPerformanceService _performanceService;

        public PerformanceController(IPerformanceService performanceService)
        {
            _performanceService = performanceService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PerformanceResponseDto>>> GetAllPerformances()
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
        public async Task<ActionResult<PerformanceResponseDto>> GetPerformanceById(int id)
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
        public async Task<ActionResult<PerformanceResponseDto>> CreatePerformance([FromBody] PerformanceCreateDto performanceDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdPerformance = await _performanceService.CreatePerformanceAsync(performanceDto);
                return CreatedAtAction(nameof(GetPerformanceById), new { id = createdPerformance.Id }, createdPerformance);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<PerformanceResponseDto>> UpdatePerformance(int id, [FromBody] PerformanceUpdateDto performanceDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedPerformance = await _performanceService.UpdatePerformanceAsync(id, performanceDto);
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