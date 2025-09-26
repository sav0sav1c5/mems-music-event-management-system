using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.API.DTOs.MediaCampaign;
using MusicEventManagementSystem.API.Services.IService;

namespace MusicEventManagementSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MediaVersionController : ControllerBase
    {
        private readonly IMediaVersionService _mediaVersionService;

        public MediaVersionController(IMediaVersionService mediaVersionService)
        {
            _mediaVersionService = mediaVersionService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MediaVersionResponseDto>>> GetAllMediaVersions()
        {
            try
            {
                var versions = await _mediaVersionService.GetAllMediaVersionsAsync();
                return Ok(versions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MediaVersionResponseDto>> GetMediaVersionById(int id)
        {
            try
            {
                var version = await _mediaVersionService.GetMediaVersionByIdAsync(id);
                if (version == null)
                    return NotFound($"MediaVersion with ID {id} not found.");
                return Ok(version);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<MediaVersionResponseDto>> CreateMediaVersion([FromBody] MediaVersionCreateDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var createdVersion = await _mediaVersionService.CreateMediaVersionAsync(createDto);
                return CreatedAtAction(nameof(GetMediaVersionById), new { id = createdVersion.MediaVersionId }, createdVersion);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<MediaVersionResponseDto>> UpdateMediaVersion(int id, [FromBody] MediaVersionUpdateDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var updatedVersion = await _mediaVersionService.UpdateMediaVersionAsync(id, updateDto);
                if (updatedVersion == null)
                    return NotFound($"MediaVersion with ID {id} not found.");
                return Ok(updatedVersion);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteMediaVersion(int id)
        {
            try
            {
                var isDeleted = await _mediaVersionService.DeleteMediaVersionAsync(id);
                if (!isDeleted)
                    return NotFound($"MediaVersion with ID {id} not found.");
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}