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

        [HttpPost("{userId}/checkout")]
        public async Task<ActionResult<CheckoutResponseDto>> Checkout(string userId, [FromBody] CheckoutRequestDto checkoutRequest)
        {
            try
            {
                checkoutRequest.ApplicationUserId = userId;
                var result = await _orderService.CheckoutAsync(userId, checkoutRequest);
                return Ok(result);
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

        [HttpGet("{userId}")]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetUserOrders(string userId)
        {
            try
            {
                var orders = await _orderService.GetUserOrdersAsync(userId);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{userId}/{orderId}")]
        public async Task<ActionResult<OrderDetailsDto>> GetOrderDetails(string userId, int orderId)
        {
            try
            {
                var orderDetails = await _orderService.GetOrderDetailsAsync(orderId, userId);
                if (orderDetails == null)
                {
                    return NotFound();
                }
                return Ok(orderDetails);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("{userId}/{orderId}/cancel")]
        public async Task<ActionResult> CancelOrder(string userId, int orderId)
        {
            try
            {
                var result = await _orderService.CancelOrderAsync(orderId, userId);
                if (result)
                {
                    return Ok(new { message = "Order cancelled successfully" });
                }
                return BadRequest("Unable to cancel order");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{userId}/tickets/{ticketId}")]
        public async Task<ActionResult<OrderTicketDto>> GetTicketDetails(string userId, int ticketId)
        {
            try
            {
                var ticket = await _orderService.GetTicketDetailsAsync(ticketId, userId);
                if (ticket == null)
                {
                    return NotFound();
                }
                return Ok(ticket);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{userId}/tickets/{ticketId}/pdf")]
        public async Task<ActionResult> GenerateTicketPdf(string userId, int ticketId)
        {
            try
            {
                var pdfBytes = await _orderService.GenerateTicketPdfAsync(ticketId, userId);

                if (pdfBytes == null || pdfBytes.Length == 0)
                {
                    return NotFound("Ticket PDF could not be generated");
                }

                return File(pdfBytes, "application/pdf", $"ticket-{ticketId}.pdf");
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
