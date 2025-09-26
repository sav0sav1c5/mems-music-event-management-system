using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.API.DTOs.MediaCampaign;
using MusicEventManagementSystem.API.Services.IService;

namespace MusicEventManagementSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MediaTaskController : ControllerBase
    {
        private readonly IMediaTaskService _mediaTaskService;

        public MediaTaskController(IMediaTaskService mediaTaskService)
        {
            _mediaTaskService = mediaTaskService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MediaTaskResponseDto>>> GetAllMediaTasks()
        {
            try
            {
                var tasks = await _mediaTaskService.GetAllMediaTasksAsync();
                return Ok(tasks);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MediaTaskResponseDto>> GetMediaTaskById(int id)
        {
            try
            {
                var task = await _mediaTaskService.GetMediaTaskByIdAsync(id);
                if (task == null)
                    return NotFound($"MediaTask with ID {id} not found.");
                return Ok(task);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<MediaTaskResponseDto>> CreateMediaTask([FromBody] MediaTaskCreateDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var createdTask = await _mediaTaskService.CreateMediaTaskAsync(createDto);
                return CreatedAtAction(nameof(GetMediaTaskById), new { id = createdTask.MediaTaskId }, createdTask);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<MediaTaskResponseDto>> UpdateMediaTask(int id, [FromBody] MediaTaskUpdateDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var updatedTask = await _mediaTaskService.UpdateMediaTaskAsync(id, updateDto);
                if (updatedTask == null)
                    return NotFound($"MediaTask with ID {id} not found.");
                return Ok(updatedTask);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteMediaTask(int id)
        {
            try
            {
                var isDeleted = await _mediaTaskService.DeleteMediaTaskAsync(id);
                if (!isDeleted)
                    return NotFound($"MediaTask with ID {id} not found.");
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}