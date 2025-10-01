using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.API.DTOs;
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Services.IService;

namespace MusicEventManagementSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PerformancesController : ControllerBase
    {
        private readonly IPerformanceService _performanceService;
        private readonly IMapper _mapper;

        public PerformancesController(IPerformanceService performanceService, IMapper mapper)
        {
            _performanceService = performanceService;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PerformanceResponseDto>>> GetAllPerformances()
        {
            try
            {
                var performances = await _performanceService.GetAllPerformancesAsync();
                var response = _mapper.Map<IEnumerable<PerformanceResponseDto>>(performances);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [HttpGet("event/{eventId}")]
        public async Task<ActionResult<IEnumerable<PerformanceResponseDto>>> GetPerformancesByEventId(int eventId)
        {
            try
            {
                var performances = await _performanceService.GetPerformancesByEventIdAsync(eventId);
                var response = _mapper.Map<IEnumerable<PerformanceResponseDto>>(performances);
                return Ok(response);
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

                var response = _mapper.Map<PerformanceResponseDto>(existingPerformance);
                return Ok(response);
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

                var performance = _mapper.Map<Performance>(performanceDto);
                var createdPerformance = await _performanceService.CreatePerformanceAsync(performance);
                var response = _mapper.Map<PerformanceResponseDto>(createdPerformance);
                return CreatedAtAction(nameof(GetPerformanceById), new { id = response.Id }, response);
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

                var performance = _mapper.Map<Performance>(performanceDto);
                var updatedPerformance = await _performanceService.UpdatePerformanceAsync(id, performance);
                if (updatedPerformance == null)
                {
                    return NotFound($"Performance with ID {id} not found.");
                }

                var response = _mapper.Map<PerformanceResponseDto>(updatedPerformance);
                return Ok(response);
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
