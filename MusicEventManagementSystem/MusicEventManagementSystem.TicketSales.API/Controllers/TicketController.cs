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
    public class TicketController : ControllerBase
    {
        private readonly ITicketService _ticketService;

        public TicketController(ITicketService ticketService)
        {
            _ticketService = ticketService;
        }

        [Authorize(Roles = "TicketSales")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TicketResponseDto>>> GetAllTickets()
        {
            try
            {
                var tickets = await _ticketService.GetAllTicketsAsync();
                return Ok(tickets);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "MEMSClient,TicketSales")]
        [HttpGet("{id}")]
        public async Task<ActionResult<TicketResponseDto>> GetTicketById(int id)
        {
            try
            {
                var existingTicket = await _ticketService.GetTicketByIdAsync(id);

                if (existingTicket == null)
                {
                    return NotFound($"Ticket with ID {id} not found.");
                }

                return Ok(existingTicket);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "MEMSClient,TicketSales")]
        [HttpPost]
        public async Task<ActionResult<TicketResponseDto>> CreateTicket([FromBody] TicketCreateDto createTicketDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdTicket = await _ticketService.CreateTicketAsync(createTicketDto);

                return CreatedAtAction(nameof(GetTicketById), new { id = createdTicket.TicketId }, createdTicket);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "TicketSales")]
        [HttpPut("{id}")]
        public async Task<ActionResult<TicketResponseDto>> UpdateTicket(int id, [FromBody] TicketUpdateDto updateTicketDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedTicket = await _ticketService.UpdateTicketAsync(id, updateTicketDto);

                if (updatedTicket == null)
                {
                    return NotFound($"Ticket with ID {id} not found.");
                }

                return Ok(updatedTicket);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "TicketSales")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteTicket(int id)
        {
            try
            {
                var isDeleted = await _ticketService.DeleteTicketAsync(id);

                if (isDeleted == false)
                {
                    return NotFound($"Ticket with ID {id} not found.");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "TicketSales")]
        [HttpGet("status/{status}")]
        public async Task<ActionResult<IEnumerable<TicketResponseDto>>> GetTicketsByStatus(TicketStatus status)
        {
            try
            {
                var tickets = await _ticketService.GetTicketsByStatusAsync(status);
                return Ok(tickets);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "MEMSClient,TicketSales")]
        [HttpGet("unique-code/{uniqueCode}")]
        public async Task<ActionResult<TicketResponseDto>> GetTicketByUniqueCode(string uniqueCode)
        {
            try
            {
                var ticket = await _ticketService.GetTicketByUniqueCodeAsync(uniqueCode);

                if (ticket == null)
                {
                    return NotFound($"Ticket with unique code {uniqueCode} not found.");
                }

                return Ok(ticket);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "MEMSClient,TicketSales")]
        [HttpGet("qr-code/{qrCode}")]
        public async Task<ActionResult<TicketResponseDto>> GetTicketByQrCode(string qrCode)
        {
            try
            {
                var ticket = await _ticketService.GetTicketByQrCodeAsync(qrCode);

                if (ticket == null)
                {
                    return NotFound($"Ticket with QR code not found.");
                }

                return Ok(ticket);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "TicketSales")]
        [HttpGet("statistics/count/{status}")]
        public async Task<ActionResult<int>> GetTicketsCountByStatus(TicketStatus status)
        {
            try
            {
                var count = await _ticketService.GetTicketsCountByStatusAsync(status);
                return Ok(count);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "TicketSales")]
        [HttpGet("statistics/revenue/total")]
        public async Task<ActionResult<decimal>> GetTotalRevenue()
        {
            try
            {
                var revenue = await _ticketService.GetTotalRevenueAsync();
                return Ok(revenue);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "TicketSales")]
        [HttpGet("statistics/revenue/date-range")]
        public async Task<ActionResult<decimal>> GetRevenueByDateRange([FromQuery] DateTime from,[FromQuery] DateTime to)
        {
            try
            {
                if (from > to)
                {
                    return BadRequest("From date cannot be greater than to date.");
                }

                var revenue = await _ticketService.GetRevenueByDateRangeAsync(from, to);
                return Ok(revenue);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "TicketSales")]
        [HttpGet("statistics/revenue/status/{status}")]
        public async Task<ActionResult<decimal>> GetRevenueByStatus(TicketStatus status)
        {
            try
            {
                var revenue = await _ticketService.GetRevenueByStatusAsync(status);
                return Ok(revenue);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [Authorize(Roles = "TicketSales")]
        [HttpGet("sold")]
        public async Task<ActionResult<IEnumerable<TicketResponseDto>>> GetSoldTickets()
        {
            try
            {
                var tickets = await _ticketService.GetSoldTicketsAsync();
                return Ok(tickets);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "TicketSales")]
        [HttpGet("today")]
        public async Task<ActionResult<IEnumerable<TicketResponseDto>>> GetTodaysTickets()
        {
            try
            {
                var tickets = await _ticketService.GetTodaysTicketsAsync();
                return Ok(tickets);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "TicketSales")]
        [HttpPost("{id}/sell")]
        public async Task<ActionResult<TicketResponseDto>> SellTicket(int id)
        {
            try
            {
                var ticket = await _ticketService.SellTicketAsync(id);

                if (ticket == null)
                {
                    return BadRequest("Ticket cannot be sold. It may not exist or may not be available.");
                }

                return Ok(ticket);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "MEMSClient,TicketSales")]
        [HttpPost("use/{uniqueCode}")]
        public async Task<ActionResult<TicketResponseDto>> UseTicket(string uniqueCode)
        {
            try
            {
                var ticket = await _ticketService.UseTicketAsync(uniqueCode);

                if (ticket == null)
                {
                    return BadRequest("Ticket cannot be used. It may not exist or may not be sold.");
                }

                return Ok(ticket);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "MEMSClient,TicketSales")]
        [HttpPost("{id}/cancel")]
        public async Task<ActionResult<TicketResponseDto>> CancelTicket(int id)
        {
            try
            {
                var ticket = await _ticketService.CancelTicketAsync(id);

                if (ticket == null)
                {
                    return NotFound($"Ticket with ID {id} not found.");
                }

                return Ok(ticket);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "MEMSClient,TicketSales")]
        [HttpGet("validate/unique-code/{uniqueCode}")]
        public async Task<ActionResult<bool>> ValidateUniqueCode(string uniqueCode)
        {
            try
            {
                var isValid = await _ticketService.IsUniqueCodeValidAsync(uniqueCode);
                return Ok(new { IsValid = isValid });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "MEMSClient,TicketSales")]
        [HttpGet("validate/qr-code/{qrCode}")]
        public async Task<ActionResult<bool>> ValidateQrCode(string qrCode)
        {
            try
            {
                var isValid = await _ticketService.IsQrCodeValidAsync(qrCode);
                return Ok(new { IsValid = isValid });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "MEMSClient,TicketSales")]
        [HttpGet("can-use/{uniqueCode}")]
        public async Task<ActionResult<bool>> CanTicketBeUsed(string uniqueCode)
        {
            try
            {
                var canBeUsed = await _ticketService.CanTicketBeUsedAsync(uniqueCode);
                return Ok(new { CanBeUsed = canBeUsed });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
