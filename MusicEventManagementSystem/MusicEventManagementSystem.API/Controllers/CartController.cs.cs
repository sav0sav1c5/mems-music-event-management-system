using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.API.Services.IServices;
using MusicEventManagementSystem.Core.Models.DTOs.Client;
using System.Security.Claims;

namespace MusicEventManagementSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        [HttpGet("{userId}")]
        public async Task<ActionResult<CartDto>> GetCart(string userId)
        {
            try
            {
                var cart = await _cartService.GetCartAsync(userId);
                return Ok(cart);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("{userId}/add")]
        public async Task<ActionResult<CartDto>> AddToCart(string userId, [FromBody] AddToCartDto addToCartDto)
        {
            try
            {
                var cart = await _cartService.AddToCartAsync(userId, addToCartDto);
                return Ok(cart);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{userId}/update")]
        public async Task<ActionResult<CartDto>> UpdateCartItem(string userId, [FromBody] UpdateCartItemDto updateDto)
        {
            try
            {
                var cart = await _cartService.UpdateCartItemAsync(userId, updateDto);
                return Ok(cart);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{userId}/remove/{ticketTypeId}")]
        public async Task<ActionResult<CartDto>> RemoveFromCart(string userId, int ticketTypeId)
        {
            try
            {
                var cart = await _cartService.RemoveFromCartAsync(userId, ticketTypeId);
                return Ok(cart);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("{userId}/clear")]
        public async Task<ActionResult> ClearCart(string userId)
        {
            try
            {
                var result = await _cartService.ClearCartAsync(userId);
                if (result)
                {
                    return Ok(new { message = "Cart cleared successfully" });
                }
                return BadRequest("Failed to clear cart");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{userId}/total")]
        public async Task<ActionResult<decimal>> GetCartTotal(string userId)
        {
            try
            {
                var total = await _cartService.CalculateCartTotalAsync(userId);
                return Ok(total);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{userId}/validate")]
        public async Task<ActionResult<bool>> ValidateCart(string userId)
        {
            try
            {
                var isValid = await _cartService.ValidateCartAsync(userId);
                return Ok(isValid);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
