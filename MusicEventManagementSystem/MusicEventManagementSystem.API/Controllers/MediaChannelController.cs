using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Services.IService;

namespace MusicEventManagementSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MediaChannelController : ControllerBase
    {
        private readonly IMediaChannelService _channelService;

        public MediaChannelController(IMediaChannelService channelService)
        {
            _channelService = channelService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MediaChannel>>> GetAllChannels()
        {
            try
            {
                var channels = await _channelService.GetAllChannelsAsync();
                return Ok(channels);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MediaChannel>> GetChannelById(int id)
        {
            try
            {
                var channel = await _channelService.GetChannelByIdAsync(id);
                if (channel == null)
                {
                    return NotFound($"Channel with ID {id} not found.");
                }
                return Ok(channel);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<MediaChannel>> CreateChannel([FromBody] MediaChannel channel)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdChannel = await _channelService.CreateChannelAsync(channel);
                return CreatedAtAction(nameof(GetChannelById), new { id = createdChannel.MediaChannelId }, createdChannel);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<MediaChannel>> UpdateChannel(int id, [FromBody] MediaChannel channel)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedChannel = await _channelService.UpdateChannelAsync(id, channel);
                if (updatedChannel == null)
                {
                    return NotFound($"Channel with ID {id} not found.");
                }

                return Ok(updatedChannel);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteChannel(int id)
        {
            try
            {
                var isDeleted = await _channelService.DeleteChannelAsync(id);
                if (!isDeleted)
                {
                    return NotFound($"Channel with ID {id} not found.");
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