using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.API.Services.IServices;
using MusicEventManagementSystem.Core.Models.DTOs.Client;

namespace MusicEventManagementSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PerformersController : ControllerBase
    {
        private readonly IClientPerformerService _performerService;

        public PerformersController(IClientPerformerService performerService)
        {
            _performerService = performerService;
        }

        [HttpGet("featured")]
        public async Task<ActionResult<IEnumerable<PerformerInfoDto>>> GetFeaturedPerformers()
        {
            try
            {
                var performers = await _performerService.GetFeaturedPerformersAsync();
                return Ok(performers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PerformerInfoDto>> GetPerformerDetails(int id)
        {
            try
            {
                var performer = await _performerService.GetPerformerDetailsAsync(id);
                if (performer == null)
                {
                    return NotFound();
                }
                return Ok(performer);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<PerformerInfoDto>>> SearchPerformers(
            [FromQuery] string? keyword,
            [FromQuery] string? genre)
        {
            try
            {
                var performers = await _performerService.SearchPerformersAsync(keyword, genre);
                return Ok(performers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
