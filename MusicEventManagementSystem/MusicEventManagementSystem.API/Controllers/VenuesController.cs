using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.API.Services.IServices;
using MusicEventManagementSystem.Core.Models.DTOs.Client;

namespace MusicEventManagementSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VenuesController : ControllerBase
    {
        private readonly IClientVenueService _venueService;

        public VenuesController(IClientVenueService venueService)
        {
            _venueService = venueService;
        }

        [AllowAnonymous]
        [HttpGet("city/{city}")]
        public async Task<ActionResult<IEnumerable<VenueInfoDto>>> GetVenuesByCity(string city)
        {
            try
            {
                var venues = await _venueService.GetVenuesByCityAsync(city);
                return Ok(venues);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<ActionResult<VenueInfoDto>> GetVenueDetails(int id)
        {
            try
            {
                var venue = await _venueService.GetVenueDetailsAsync(id);
                if (venue == null)
                {
                    return NotFound();
                }
                return Ok(venue);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [AllowAnonymous]
        [HttpGet("{venueId}/events")]
        public async Task<ActionResult<IEnumerable<ClientEventDto>>> GetVenueEvents(int venueId)
        {
            try
            {
                var events = await _venueService.GetVenueEventsAsync(venueId);
                return Ok(events);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
