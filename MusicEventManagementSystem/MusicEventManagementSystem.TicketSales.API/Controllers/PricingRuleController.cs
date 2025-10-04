using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.Core.Interfaces.Services.ITicketSales;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;

namespace MusicEventManagementSystem.TicketSales.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PricingRuleController : ControllerBase
    {
        private readonly IPricingRuleService _pricingRuleService;

        public PricingRuleController(IPricingRuleService pricingRuleService)
        {
            _pricingRuleService = pricingRuleService;
        }

        // GET: api/pricingrule
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PricingRuleResponseDto>>> GetAllPricingRules()
        {
            try
            {
                var pricingRules = await _pricingRuleService.GetAllPricingRulesAsync();
                return Ok(pricingRules);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/pricingrule/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<PricingRuleResponseDto>> GetPricingRuleById(int id)
        {
            try
            {
                var existingPricingRule = await _pricingRuleService.GetPricingRuleByIdAsync(id);

                if (existingPricingRule == null)
                {
                    return NotFound($"Pricing Rule with ID {id} not found.");
                }

                return Ok(existingPricingRule);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/pricingrule
        [HttpPost]
        public async Task<ActionResult<PricingRuleResponseDto>> CreatePricingRule([FromBody] PricingRuleCreateDto createPricingRuleDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdPricingRule = await _pricingRuleService.CreatePricingRuleAsync(createPricingRuleDto);

                return CreatedAtAction(nameof(GetPricingRuleById), new { id = createdPricingRule.PricingRuleId }, createdPricingRule);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/pricingrule/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<PricingRuleResponseDto>> UpdatePricingRule(int id, [FromBody] PricingRuleUpdateDto updatePricingRuleDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedPricingRule = await _pricingRuleService.UpdatePricingRuleAsync(id, updatePricingRuleDto);

                if (updatedPricingRule == null)
                {
                    return NotFound($"Pricing Rule with ID {id} not found.");
                }

                return Ok(updatedPricingRule);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/pricingrule/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeletePricingRule(int id)
        {
            try
            {
                var isDeleted = await _pricingRuleService.DeletePricingRuleAsync(id);

                if (isDeleted == false)
                {
                    return NotFound($"Pricing Rule with ID {id} not found.");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/pricingrule/{id}/calculate-price
        [HttpPost("{id}/calculate-price")]
        public async Task<ActionResult<decimal>> CalculatePrice(int id, [FromBody] CalculatePriceRequestDto priceRequestDto)
        {
            try
            {
                var calculatedPrice = await _pricingRuleService.CalculatePriceAsync(id, priceRequestDto);

                return Ok(calculatedPrice);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/pricingrule/active
        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<PricingRuleResponseDto>>> GetActivePricingRules()
        {
            try
            {
                var activePricingRules = await _pricingRuleService.GetActivePricingRulesAsync();
                return Ok(activePricingRules);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/pricingrule/event/{eventId}
        [HttpGet("event/{eventId}")]
        public async Task<ActionResult<IEnumerable<PricingRuleResponseDto>>> GetPricingRulesByEvent(int eventId)
        {
            try
            {
                var pricingRules = await _pricingRuleService.GetPricingRulesByEventAsync(eventId);
                return Ok(pricingRules);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/pricingrule/ticket-type/{ticketTypeId}
        [HttpGet("ticket-type/{ticketTypeId}")]
        public async Task<ActionResult<IEnumerable<PricingRuleResponseDto>>> GetPricingRulesByTicketType(int ticketTypeId)
        {
            try
            {
                var pricingRules = await _pricingRuleService.GetPricingRulesByTicketTypeAsync(ticketTypeId);
                return Ok(pricingRules);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
