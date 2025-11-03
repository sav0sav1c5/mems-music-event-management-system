using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.API.Enums.TicketSales;
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Services;
using MusicEventManagementSystem.API.Services.IService;
using System;

namespace MusicEventManagementSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SpecialOfferController : ControllerBase
    {
        private readonly ISpecialOfferService _specialOfferService;

        public SpecialOfferController(ISpecialOfferService specialOfferService)
        {
            _specialOfferService = specialOfferService;
        }

        // GET: api/specialoffer
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SpecialOffer>>> GetAllSpecialOffers()
        {
            try
            {
                var specialOffers = await _specialOfferService.GetAllSpecialOffersAsync();
                return Ok(specialOffers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/specialoffer/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<SpecialOffer>> GetSpecialOfferById(int id)
        {
            try
            {
                var existingSpecialOffer = await _specialOfferService.GetSpecialOfferByIdAsync(id);

                if (existingSpecialOffer == null)
                {
                    return NotFound($"Special Offer with ID {id} not found.");
                }

                return Ok(existingSpecialOffer);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/specialoffer
        [HttpPost]
        public async Task<ActionResult<SpecialOffer>> CreateSpecialOffer([FromBody] SpecialOffer specialOffer)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdSpecialOffer = await _specialOfferService.CreateSpecialOfferAsync(specialOffer);

                return CreatedAtAction(nameof(GetSpecialOfferById), new { id = createdSpecialOffer.SpecialOfferId }, createdSpecialOffer);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/specialoffer/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<SpecialOffer>> UpdateSpecialOffer(int id, [FromBody] SpecialOffer specialOffer)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedSpecialOffer = await _specialOfferService.UpdateSpecialOfferAsync(id, specialOffer);

                if (updatedSpecialOffer == null)
                {
                    return NotFound($"Special Offer with ID {id} not found.");
                }

                return Ok(updatedSpecialOffer);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/specialoffer/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteSpecialOffer(int id)
        {
            try
            {
                var isDeleted = await _specialOfferService.DeleteSpecialOfferAsync(id);

                if (isDeleted == false)
                {
                    return NotFound($"Special Offer with ID {id} not found.");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/specialoffer/active?date=
        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<SpecialOffer>>> GetActiveOffers([FromQuery] DateTime? date = null)
        {
            try
            {
                var checkDate = date ?? DateTime.UtcNow;
                var activeOffers = await _specialOfferService.GetActiveOffersAsync(checkDate);
                return Ok(activeOffers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/specialoffer/by-type/{offerType}
        [HttpGet("by-type/{offerType}")]
        public async Task<ActionResult<IEnumerable<SpecialOffer>>> GetByOfferType(OfferType offerType)
        {
            try
            {
                var offers = await _specialOfferService.GetByOfferTypeAsync(offerType);
                return Ok(offers);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/specialoffer/by-date-range?start=&end=
        [HttpGet("by-date-range")]
        public async Task<ActionResult<IEnumerable<SpecialOffer>>> GetByDateRange([FromQuery] DateTime start, [FromQuery] DateTime end)
        {
            try
            {
                var offers = await _specialOfferService.GetByDateRangeAsync(start, end);
                return Ok(offers);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/specialoffer/by-ticket-type/{ticketTypeId}
        [HttpGet("by-ticket-type/{ticketTypeId}")]
        public async Task<ActionResult<IEnumerable<SpecialOffer>>> GetByTicketType(int ticketTypeId)
        {
            try
            {
                var offers = await _specialOfferService.GetByTicketTypeAsync(ticketTypeId);
                return Ok(offers);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/specialoffer/{id}/is-valid
        [HttpGet("{id}/is-valid")]
        public async Task<ActionResult<object>> IsOfferValid(int id, [FromQuery] DateTime? checkDate = null)
        {
            try
            {
                var dateToCheck = checkDate ?? DateTime.UtcNow;
                var isValid = await _specialOfferService.IsOfferValidAsync(id, dateToCheck);

                return Ok(new
                {
                    SpecialOfferId = id,
                    CheckDate = dateToCheck,
                    IsValid = isValid
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/specialoffer/ticket-type/{ticketTypeId}/has-active-offer
        [HttpGet("ticket-type/{ticketTypeId}/has-active-offer")]
        public async Task<ActionResult<object>> HasActiveOfferForTicketType(int ticketTypeId, [FromQuery] DateTime? checkDate = null)
        {
            try
            {
                var dateToCheck = checkDate ?? DateTime.UtcNow;
                var hasActiveOffer = await _specialOfferService.HasActiveOfferForTicketTypeAsync(ticketTypeId, dateToCheck);

                return Ok(new
                {
                    TicketTypeId = ticketTypeId,
                    CheckDate = dateToCheck,
                    HasActiveOffer = hasActiveOffer
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
