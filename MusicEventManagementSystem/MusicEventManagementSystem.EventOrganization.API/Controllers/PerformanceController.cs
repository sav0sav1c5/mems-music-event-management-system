using Microsoft.AspNetCore.Authorization;
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

        [Authorize(Roles = "MEMSClient,EventOrganization,TicketSales")]
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

        [Authorize(Roles = "MEMSClient,EventOrganization,TicketSales")]
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

        [Authorize(Roles = "EventOrganization")]
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

        [Authorize(Roles = "EventOrganization,TicketSales")]
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

        [Authorize(Roles = "EventOrganization")]
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

        [Authorize(Roles = "MEMSClient,EventOrganization,TicketSales")]
        [HttpGet("by-performer/{performerId}")]
        public async Task<ActionResult<IEnumerable<PerformanceResponseDto>>> GetByPerformerId(int performerId)
        {
            try
            {
                var performances = await _performanceService.GetByPerformerIdAsync(performerId);
                return Ok(performances);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "MEMSClient,EventOrganization,TicketSales")]
        [HttpGet("by-venue/{venueId}")]
        public async Task<ActionResult<IEnumerable<PerformanceResponseDto>>> GetByVenueId(int venueId)
        {
            try
            {
                var performances = await _performanceService.GetByVenueIdAsync(venueId);
                return Ok(performances);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "MEMSClient,EventOrganization,TicketSales")]
        [HttpGet("date-range")]
        public async Task<ActionResult<IEnumerable<PerformanceResponseDto>>> GetByDateRange([FromQuery] DateTime start, [FromQuery] DateTime end)
        {
            try
            {
                var performances = await _performanceService.GetByDateRangeAsync(start, end);
                return Ok(performances);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        } 
    }
}