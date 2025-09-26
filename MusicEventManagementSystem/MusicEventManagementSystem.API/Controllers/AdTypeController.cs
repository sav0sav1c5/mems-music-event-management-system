using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.API.DTOs.MediaCampaign;
using MusicEventManagementSystem.API.Services.IService;

namespace MusicEventManagementSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdTypeController : ControllerBase
    {
        private readonly IAdTypeService _adTypeService;

        public AdTypeController(IAdTypeService adTypeService)
        {
            _adTypeService = adTypeService;
        }

        // GET: api/adtype
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AdTypeResponseDto>>> GetAllAdTypes()
        {
            try
            {
                var adTypes = await _adTypeService.GetAllAdTypesAsync();
                return Ok(adTypes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/adtype/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<AdTypeResponseDto>> GetAdTypeById(int id)
        {
            try
            {
                var adType = await _adTypeService.GetAdTypeByIdAsync(id);
                if (adType == null)
                    return NotFound($"AdType with ID {id} not found.");

                return Ok(adType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/adtype
        [HttpPost]
        public async Task<ActionResult<AdTypeResponseDto>> CreateAdType([FromBody] AdTypeCreateDto adTypeCreateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdAdType = await _adTypeService.CreateAdTypeAsync(adTypeCreateDto);

                return CreatedAtAction(nameof(GetAdTypeById), new { id = createdAdType.AdTypeId }, createdAdType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/adtype/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<AdTypeResponseDto>> UpdateAdType(int id, [FromBody] AdTypeUpdateDto adTypeUpdateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedAdType = await _adTypeService.UpdateAdTypeAsync(id, adTypeUpdateDto);

                if (updatedAdType == null)
                {
                    return NotFound($"AdType with ID {id} not found.");
                }

                return Ok(updatedAdType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/adtype/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAdType(int id)
        {
            try
            {
                var isDeleted = await _adTypeService.DeleteAdTypeAsync(id);

                if (!isDeleted)
                {
                    return NotFound($"AdType with ID {id} not found.");
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