using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.API.DTOs.MediaCampaign;
using MusicEventManagementSystem.API.Services.IService;

namespace MusicEventManagementSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MediaChannelController : ControllerBase
    {
        private readonly IMediaChannelService _mediaChannelService;

        public MediaChannelController(IMediaChannelService mediaChannelService)
        {
            _mediaChannelService = mediaChannelService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MediaChannelResponseDto>>> GetAllMediaChannels()
        {
            try
            {
                var channels = await _mediaChannelService.GetAllMediaChannelsAsync();
                return Ok(channels);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MediaChannelResponseDto>> GetMediaChannelById(int id)
        {
            try
            {
                var channel = await _mediaChannelService.GetMediaChannelByIdAsync(id);
                if (channel == null)
                    return NotFound($"MediaChannel with ID {id} not found.");
                return Ok(channel);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<MediaChannelResponseDto>> CreateMediaChannel([FromBody] MediaChannelCreateDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var createdChannel = await _mediaChannelService.CreateMediaChannelAsync(createDto);
                return CreatedAtAction(nameof(GetMediaChannelById), new { id = createdChannel.MediaChannelId }, createdChannel);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<MediaChannelResponseDto>> UpdateMediaChannel(int id, [FromBody] MediaChannelUpdateDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var updatedChannel = await _mediaChannelService.UpdateMediaChannelAsync(id, updateDto);
                if (updatedChannel == null)
                    return NotFound($"MediaChannel with ID {id} not found.");
                return Ok(updatedChannel);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteMediaChannel(int id)
        {
            try
            {
                var isDeleted = await _mediaChannelService.DeleteMediaChannelAsync(id);
                if (!isDeleted)
                    return NotFound($"MediaChannel with ID {id} not found.");
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}