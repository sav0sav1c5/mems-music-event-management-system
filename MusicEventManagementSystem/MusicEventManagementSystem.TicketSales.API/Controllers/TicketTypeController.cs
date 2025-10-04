using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;

namespace MusicEventManagementSystem.TicketSales.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TicketTypeController : ControllerBase
    {
        private readonly ITicketTypeService _ticketTypeService;

        public TicketTypeController(ITicketTypeService ticketTypeService)
        {
            _ticketTypeService = ticketTypeService;
        }

        [Authorize(Roles = "MEMSClient,TicketSales")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TicketTypeResponseDto>>> GetAllTicketTypes()
        {
            try
            {
                var ticketTypes = await _ticketTypeService.GetAllTicketTypesAsync();
                return Ok(ticketTypes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "MEMSClient,TicketSales")]
        [HttpGet("{id}")]
        public async Task<ActionResult<TicketTypeResponseDto>> GetTicketTypeById(int id)
        {
            try
            {
                var existingTicketType = await _ticketTypeService.GetTicketTypeByIdAsync(id);

                if (existingTicketType == null)
                {
                    return NotFound($"Ticket Type with ID {id} not found.");
                }

                return Ok(existingTicketType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "TicketSales")]
        [HttpPost]
        public async Task<ActionResult<TicketTypeResponseDto>> CreateTicketType([FromBody] TicketTypeCreateDto createTicketTypeDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdTicketType = await _ticketTypeService.CreateTicketTypeAsync(createTicketTypeDto);

                return CreatedAtAction(nameof(GetTicketTypeById), new { id = createdTicketType.TicketTypeId }, createdTicketType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "TicketSales")]
        [HttpPut("{id}")]
        public async Task<ActionResult<TicketTypeResponseDto>> UpdateTicketType(int id, [FromBody] TicketTypeUpdateDto updateTicketTypeDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedTicketType = await _ticketTypeService.UpdateTicketTypeAsync(id, updateTicketTypeDto);

                if (updatedTicketType == null)
                {
                    return NotFound($"Ticket Type with ID {id} not found.");
                }

                return Ok(updatedTicketType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "TicketSales")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteTicketType(int id)
        {
            try
            {
                var isDeleted = await _ticketTypeService.DeleteTicketTypeAsync(id);

                if (isDeleted == false)
                {
                    return NotFound($"Ticket Type with ID {id} not found.");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "MEMSClient,TicketSales")]
        [HttpGet("zone/{zoneId}")]
        public async Task<ActionResult<IEnumerable<TicketTypeResponseDto>>> GetByZoneId(int zoneId)
        {
            try
            {
                var ticketTypes = await _ticketTypeService.GetByZoneIdAsync(zoneId);
                return Ok(ticketTypes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "MEMSClient,TicketSales")]
        [HttpGet("event/{eventId}")]
        public async Task<ActionResult<IEnumerable<TicketTypeResponseDto>>> GetByEventId(int eventId)
        {
            try
            {
                var ticketTypes = await _ticketTypeService.GetByEventIdAsync(eventId);
                return Ok(ticketTypes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "MEMSClient,TicketSales")]
        [HttpGet("status/{status}")]
        public async Task<ActionResult<IEnumerable<TicketTypeResponseDto>>> GetByStatus(TicketTypeStatus status)
        {
            try
            {
                var ticketTypes = await _ticketTypeService.GetByStatusAsync(status);
                return Ok(ticketTypes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "MEMSClient,TicketSales")]
        [HttpGet("available")]
        public async Task<ActionResult<IEnumerable<TicketTypeResponseDto>>> GetAvailable()
        {
            try
            {
                var ticketTypes = await _ticketTypeService.GetAvailableTicketTypesAsync();
                return Ok(ticketTypes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "TicketSales")]
        [HttpPut("{id}/quantity")]
        public async Task<ActionResult> UpdateAvailableQuantity(int id, [FromBody] int quantity)
        {
            try
            {
                var isUpdated = await _ticketTypeService.UpdateAvailableQuantityAsync(id, quantity);

                if (!isUpdated)
                {
                    return NotFound($"Ticket Type with ID {id} not found or invalid quantity.");
                }

                return Ok($"Available quantity updated successfully for Ticket Type {id}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "MEMSClient,TicketSales")]
        [HttpGet("zone/{zoneId}/event/{eventId}")]
        public async Task<ActionResult<IEnumerable<TicketTypeResponseDto>>> GetByZoneAndEvent(int zoneId, int eventId)
        {
            try
            {
                var ticketTypes = await _ticketTypeService.GetByZoneAndEventAsync(zoneId, eventId);
                return Ok(ticketTypes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "MEMSClient,TicketSales")]
        [HttpGet("event/{eventId}/totalquantity")]
        public async Task<ActionResult<int>> GetTotalAvailableQuantityByEvent(int eventId)
        {
            try
            {
                var totalQuantity = await _ticketTypeService.GetTotalAvailableQuantityByEventAsync(eventId);
                return Ok(totalQuantity);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "MEMSClient,TicketSales")]
        [HttpPost("{id}/reserve")]
        public async Task<ActionResult> ReserveTickets(int id, [FromBody] int quantity)
        {
            try
            {
                var isReserved = await _ticketTypeService.ReserveTicketsAsync(id, quantity);

                if (!isReserved)
                {
                    return BadRequest($"Unable to reserve {quantity} tickets for Ticket Type {id}. Insufficient quantity or invalid request.");
                }

                return Ok($"Successfully reserved {quantity} tickets for Ticket Type {id}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "MEMSClient,TicketSales")]
        [HttpPost("{id}/release")]
        public async Task<ActionResult> ReleaseTickets(int id, [FromBody] int quantity)
        {
            try
            {
                var isReleased = await _ticketTypeService.ReleaseTicketsAsync(id, quantity);

                if (!isReleased)
                {
                    return BadRequest($"Unable to release {quantity} tickets for Ticket Type {id}. Invalid request.");
                }

                return Ok($"Successfully released {quantity} tickets for Ticket Type {id}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
