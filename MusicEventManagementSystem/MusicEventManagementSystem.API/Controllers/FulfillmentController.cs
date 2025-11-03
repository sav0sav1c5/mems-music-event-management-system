using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.API.Services.IService;

namespace MusicEventManagementSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FulfillmentController : ControllerBase
    {
        private readonly IFulfillmentService _fulfillmentService;

        public FulfillmentController(IFulfillmentService fulfillmentService)
        {
            _fulfillmentService = fulfillmentService;
        }

        /// <summary>
        /// Updates the fulfillment status of a requirement and automatically updates related contract fields if configured
        /// </summary>
        [HttpPut("{fulfillmentId}/status")]
        public async Task<ActionResult> UpdateFulfillmentStatus(
            int fulfillmentId, 
            [FromBody] UpdateFulfillmentStatusRequest request)
        {
            try
            {
                var result = await _fulfillmentService.UpdateFulfillmentStatusAsync(
                    fulfillmentId, 
                    request.IsFulfilled, 
                    request.FulfilledBy);

                if (!result)
                {
                    return NotFound($"Fulfillment with ID {fulfillmentId} not found.");
                }

                return Ok(new { 
                    message = "Fulfillment status updated successfully",
                    fulfillmentId = fulfillmentId,
                    isFulfilled = request.IsFulfilled
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Gets fulfillment with details including requirement information
        /// </summary>
        [HttpGet("{fulfillmentId}")]
        public async Task<ActionResult> GetFulfillmentDetails(int fulfillmentId)
        {
            try
            {
                var fulfillment = await _fulfillmentService.GetFulfillmentWithDetailsAsync(fulfillmentId);
                
                if (fulfillment == null)
                {
                    return NotFound($"Fulfillment with ID {fulfillmentId} not found.");
                }

                return Ok(fulfillment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Gets all fulfillments for a negotiation
        /// </summary>
        [HttpGet("negotiation/{negotiationId}")]
        public async Task<ActionResult> GetNegotiationFulfillments(int negotiationId)
        {
            try
            {
                var fulfillments = await _fulfillmentService.GetNegotiationFulfillmentsAsync(negotiationId);
                return Ok(fulfillments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }

    public class UpdateFulfillmentStatusRequest
    {
        public bool IsFulfilled { get; set; }
        public string FulfilledBy { get; set; } = string.Empty;
    }
}