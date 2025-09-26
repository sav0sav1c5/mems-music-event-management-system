using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Models;
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

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AdType>>> GetAllAdTypes()
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

        [HttpGet("{id}")]
        public async Task<ActionResult<AdType>> GetAdTypeById(int id)
        {
            try
            {
                var adType = await _adTypeService.GetAdTypeByIdAsync(id);
                if (adType == null)
                {
                    return NotFound($"AdType with ID {id} not found.");
                }
                return Ok(adType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<AdType>> CreateAdType([FromBody] AdType adType)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdAdType = await _adTypeService.CreateAdTypeAsync(adType);
                return CreatedAtAction(nameof(GetAdTypeById), new { id = createdAdType.AdTypeId }, createdAdType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<AdType>> UpdateAdType(int id, [FromBody] AdType adType)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedAdType = await _adTypeService.UpdateAdTypeAsync(id, adType);
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