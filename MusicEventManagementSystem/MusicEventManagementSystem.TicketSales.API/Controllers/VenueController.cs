using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.DTOs.EventOrganization;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;

namespace MusicEventManagementSystem.TicketSales.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class VenueController : ControllerBase
    {
        private readonly IVenueService _venueService;

        public VenueController(IVenueService venueService)
        {
            _venueService = venueService;
        }

        [Authorize(Roles = "MEMSClient,TicketSales")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VenueResponseDto>>> GetAllVenues()
        {
            try
            {
                var venues = await _venueService.GetAllVenuesAsync();
                return Ok(venues);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "MEMSClient,TicketSales")]
        [HttpGet("{id}")]
        public async Task<ActionResult<VenueResponseDto>> GetVenueById(int id)
        {
            try
            {
                var existingVenue = await _venueService.GetVenueByIdAsync(id);
                
                if (existingVenue == null)
                {
                    return NotFound($"Venue with ID {id} not found.");
                }
                
                return Ok(existingVenue);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "TicketSales")]
        [HttpPost]
        public async Task<ActionResult<VenueResponseDto>> CreateVenue([FromBody] VenueCreateDto venueCreateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdVenue = await _venueService.CreateVenueAsync(venueCreateDto);

                return CreatedAtAction(nameof(GetVenueById), new { id = createdVenue.VenueId }, createdVenue);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "TicketSales")]
        [HttpPut("{id}")]
        public async Task<ActionResult<VenueResponseDto>> UpdateVenue(int id, [FromBody] VenueUpdateDto venueUpdateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedVenue = await _venueService.UpdateVenueAsync(id, venueUpdateDto);

                if (updatedVenue == null)
                {
                    return NotFound($"Venue with ID {id} not found.");
                }

                return Ok(updatedVenue);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "TicketSales")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteVenue(int id)
        {
            try
            {
                var isDeleted = await _venueService.DeleteVenueAsync(id);

                if (isDeleted == false)
                {
                    return NotFound($"Venue with ID {id} not found.");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "MEMSClient,TicketSales")]
        [HttpGet("city/{city}")]
        public async Task<ActionResult<IEnumerable<VenueResponseDto>>> GetVenuesByCity(string city)
        {
            try
            {
                var venues = await _venueService.GetByCityAsync(city);
                return Ok(venues);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "MEMSClient,TicketSales")]
        [HttpGet("capacity")]
        public async Task<ActionResult<IEnumerable<VenueResponseDto>>> GetByCapacityRange([FromQuery] int min, [FromQuery] int max)
        {
            try
            {
                var venues = await _venueService.GetByCapacityRangeAsync(min, max);
                return Ok(venues);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "MEMSClient,TicketSales")]
        [HttpGet("{id}/segments")]
        public async Task<ActionResult<IEnumerable<SegmentResponseDto>>> GetSegments(int id)
        {
            try
            {
                var segments = await _venueService.GetSegmentsAsync(id);
                return Ok(segments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "MEMSClient,TicketSales")]
        [HttpGet("{id}/capacity")]
        public async Task<ActionResult<int>> CalculateTotalCapacity(int id)
        {
            try
            {
                var totalCapacity = await _venueService.CalculateTotalCapacityAsync(id);
                return Ok(totalCapacity);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "MEMSClient,TicketSales")]
        [HttpGet("by-event/{eventId}")]
        public async Task<ActionResult<IEnumerable<VenueResponseDto>>> GetByEventId(int eventId)
        {
            try
            {
                var venues = await _venueService.GetByEventIdAsync(eventId);
                return Ok(venues);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "MEMSClient,TicketSales")]
        [HttpGet("{id}/performances")]
        public async Task<ActionResult<IEnumerable<PerformanceResponseDto>>> GetPerformances(int id)
        {
            try
            {
                var performances = await _venueService.GetPerformancesAsync(id);
                return Ok(performances);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
