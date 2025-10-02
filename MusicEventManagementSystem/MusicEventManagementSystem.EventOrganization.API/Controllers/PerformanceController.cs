using AutoMapper;
using Microsoft.AspNetCore.Mvc;
<<<<<<< HEAD:MusicEventManagementSystem/MusicEventManagementSystem.API/Controllers/PerformancesController.cs
using MusicEventManagementSystem.API.DTOs;
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Services.IService;
=======
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.DTOs.EventOrganization;
>>>>>>> fc7d1e8729b7d2d6668f9b466d7f35e20a9a6543:MusicEventManagementSystem/MusicEventManagementSystem.EventOrganization.API/Controllers/PerformanceController.cs

namespace MusicEventManagementSystem.EventOrganization.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PerformanceController : ControllerBase
    {
        private readonly IPerformanceService _performanceService;
        private readonly IMapper _mapper;

<<<<<<< HEAD:MusicEventManagementSystem/MusicEventManagementSystem.API/Controllers/PerformancesController.cs
        public PerformancesController(IPerformanceService performanceService, IMapper mapper)
=======
        public PerformanceController(IPerformanceService performanceService)
>>>>>>> fc7d1e8729b7d2d6668f9b466d7f35e20a9a6543:MusicEventManagementSystem/MusicEventManagementSystem.EventOrganization.API/Controllers/PerformanceController.cs
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

<<<<<<< HEAD:MusicEventManagementSystem/MusicEventManagementSystem.API/Controllers/PerformancesController.cs
                var performance = _mapper.Map<Performance>(performanceDto);
                var createdPerformance = await _performanceService.CreatePerformanceAsync(performance);
                var response = _mapper.Map<PerformanceResponseDto>(createdPerformance);
                return CreatedAtAction(nameof(GetPerformanceById), new { id = response.Id }, response);
=======
                var createdPerformance = await _performanceService.CreatePerformanceAsync(performanceDto);
                return CreatedAtAction(nameof(GetPerformanceById), new { id = createdPerformance.Id }, createdPerformance);
>>>>>>> fc7d1e8729b7d2d6668f9b466d7f35e20a9a6543:MusicEventManagementSystem/MusicEventManagementSystem.EventOrganization.API/Controllers/PerformanceController.cs
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

<<<<<<< HEAD:MusicEventManagementSystem/MusicEventManagementSystem.API/Controllers/PerformancesController.cs
                var performance = _mapper.Map<Performance>(performanceDto);
                var updatedPerformance = await _performanceService.UpdatePerformanceAsync(id, performance);
=======
                var updatedPerformance = await _performanceService.UpdatePerformanceAsync(id, performanceDto);
>>>>>>> fc7d1e8729b7d2d6668f9b466d7f35e20a9a6543:MusicEventManagementSystem/MusicEventManagementSystem.EventOrganization.API/Controllers/PerformanceController.cs
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
