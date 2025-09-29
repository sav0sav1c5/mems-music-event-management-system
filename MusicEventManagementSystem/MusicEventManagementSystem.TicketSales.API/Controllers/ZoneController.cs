using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;

namespace MusicEventManagementSystem.TicketSales.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ZoneController : ControllerBase
    {
        private readonly IZoneService _zoneService;

        public ZoneController(IZoneService zoneService)
        {
            _zoneService = zoneService;
        }

        // GET: api/zone
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ZoneResponseDto>>> GetAllZones()
        {
            try
            {
                var zones = await _zoneService.GetAllZonesAsync();
                return Ok(zones);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/zone/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ZoneResponseDto>> GetZoneById(int id)
        {
            try
            {
                var existingZone = await _zoneService.GetZoneByIdAsync(id);

                if (existingZone == null)
                {
                    return NotFound($"Zone with ID {id} not found.");
                }

                return Ok(existingZone);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/zone
        [HttpPost]
        public async Task<ActionResult<ZoneResponseDto>> CreateZone([FromBody] ZoneCreateDto createZoneDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdZone = await _zoneService.CreateZoneAsync(createZoneDto);

                return CreatedAtAction(nameof(GetZoneById), new { id = createdZone.ZoneId }, createdZone);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/zone/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<ZoneResponseDto>> UpdateZone(int id, [FromBody] ZoneUpdateDto updateZoneDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedZone = await _zoneService.UpdateZoneAsync(id, updateZoneDto);

                if (updatedZone == null)
                {
                    return NotFound($"Zone with ID {id} not found.");
                }

                return Ok(updatedZone);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/zone/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteZone(int id)
        {
            try
            {
                var isDeleted = await _zoneService.DeleteZoneAsync(id);

                if (isDeleted == false)
                {
                    return NotFound($"Zone with ID {id} not found.");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/zone/segment/{segmentId}
        [HttpGet("segment/{segmentId}")]
        public async Task<ActionResult<IEnumerable<ZoneResponseDto>>> GetZonesBySegmentId(int segmentId)
        {
            try
            {
                var zones = await _zoneService.GetBySegmentIdAsync(segmentId);
                return Ok(zones);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/zone/price?min=&max=
        [HttpGet("price")]
        public async Task<ActionResult<IEnumerable<ZoneResponseDto>>> GetZonesByPriceRange([FromQuery] decimal min, [FromQuery] decimal max)
        {
            try
            {
                var zones = await _zoneService.GetByPriceRangeAsync(min, max);
                return Ok(zones);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/zone/position/{position}
        [HttpGet("position/{position}")]
        public async Task<ActionResult<IEnumerable<ZoneResponseDto>>> GetZonesByPosition(ZonePosition position)
        {
            try
            {
                var zones = await _zoneService.GetByPositionAsync(position);
                return Ok(zones);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/zone/{id}/tickettypes
        [HttpGet("{id}/tickettypes")]
        public async Task<ActionResult<IEnumerable<TicketTypeResponseDto>>> GetTicketTypesByZoneId(int id)
        {
            try
            {
                var ticketTypes = await _zoneService.GetTicketTypesAsync(id);
                return Ok(ticketTypes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
