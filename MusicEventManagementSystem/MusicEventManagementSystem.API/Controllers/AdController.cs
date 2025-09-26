using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Services.IService;

namespace MusicEventManagementSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdController : ControllerBase
    {
        private readonly IAdService _adService;

        public AdController(IAdService adService)
        {
            _adService = adService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Ad>>> GetAllAds()
        {
            try
            {
                var ads = await _adService.GetAllAdsAsync();
                return Ok(ads);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Ad>> GetAdById(int id)
        {
            try
            {
                var ad = await _adService.GetAdByIdAsync(id);
                if (ad == null)
                {
                    return NotFound($"Ad with ID {id} not found.");
                }
                return Ok(ad);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Ad>> CreateAd([FromBody] Ad ad)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdAd = await _adService.CreateAdAsync(ad);
                return CreatedAtAction(nameof(GetAdById), new { id = createdAd.AdId }, createdAd);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Ad>> UpdateAd(int id, [FromBody] Ad ad)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedAd = await _adService.UpdateAdAsync(id, ad);
                if (updatedAd == null)
                {
                    return NotFound($"Ad with ID {id} not found.");
                }

                return Ok(updatedAd);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAd(int id)
        {
            try
            {
                var isDeleted = await _adService.DeleteAdAsync(id);
                if (!isDeleted)
                {
                    return NotFound($"Ad with ID {id} not found.");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}