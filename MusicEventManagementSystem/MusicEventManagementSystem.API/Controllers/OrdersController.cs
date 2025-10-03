using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.API.Services.IServices;
using MusicEventManagementSystem.Core.Models.DTOs.Client;
using System.Security.Claims;

namespace MusicEventManagementSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        private string GetUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                   throw new UnauthorizedAccessException("User not authenticated");
        }

        [HttpPost("checkout")]
        public async Task<ActionResult<CheckoutResponseDto>> Checkout([FromBody] CheckoutRequestDto checkoutRequest)
        {
            try
            {
                var userId = GetUserId();
                checkoutRequest.ApplicationUserId = userId;

                var result = await _orderService.CheckoutAsync(userId, checkoutRequest);
                return Ok(result);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetUserOrders()
        {
            try
            {
                var userId = GetUserId();
                var orders = await _orderService.GetUserOrdersAsync(userId);
                return Ok(orders);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{orderId}")]
        public async Task<ActionResult<OrderDetailsDto>> GetOrderDetails(int orderId)
        {
            try
            {
                var userId = GetUserId();
                var orderDetails = await _orderService.GetOrderDetailsAsync(orderId, userId);
                if (orderDetails == null)
                {
                    return NotFound();
                }
                return Ok(orderDetails);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("{orderId}/cancel")]
        public async Task<ActionResult> CancelOrder(int orderId)
        {
            try
            {
                var userId = GetUserId();
                var result = await _orderService.CancelOrderAsync(orderId, userId);
                if (result)
                {
                    return Ok(new { message = "Order cancelled successfully" });
                }
                return BadRequest("Unable to cancel order");
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("tickets/{ticketId}")]
        public async Task<ActionResult<OrderTicketDto>> GetTicketDetails(int ticketId)
        {
            try
            {
                var userId = GetUserId();
                var ticket = await _orderService.GetTicketDetailsAsync(ticketId, userId);
                if (ticket == null)
                {
                    return NotFound();
                }
                return Ok(ticket);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("tickets/{ticketId}/pdf")]
        public async Task<ActionResult> GenerateTicketPdf(int ticketId)
        {
            try
            {
                var userId = GetUserId();
                var pdfBytes = await _orderService.GenerateTicketPdfAsync(ticketId, userId);

                if (pdfBytes == null || pdfBytes.Length == 0)
                {
                    return NotFound("Ticket PDF could not be generated");
                }

                return File(pdfBytes, "application/pdf", $"ticket-{ticketId}.pdf");
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
