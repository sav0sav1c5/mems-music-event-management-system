using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.API.DTOs.MediaCampaign;
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
        public async Task<ActionResult<IEnumerable<AdResponseDto>>> GetAllAds()
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
        public async Task<ActionResult<AdResponseDto>> GetAdById(int id)
        {
            try
            {
                var ad = await _adService.GetAdByIdAsync(id);
                if (ad == null)
                    return NotFound($"Ad with ID {id} not found.");
                return Ok(ad);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<AdResponseDto>> CreateAd([FromBody] AdCreateDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var createdAd = await _adService.CreateAdAsync(createDto);
                return CreatedAtAction(nameof(GetAdById), new { id = createdAd.AdId }, createdAd);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<AdResponseDto>> UpdateAd(int id, [FromBody] AdUpdateDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var updatedAd = await _adService.UpdateAdAsync(id, updateDto);
                if (updatedAd == null)
                    return NotFound($"Ad with ID {id} not found.");
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
                    return NotFound($"Ad with ID {id} not found.");
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}