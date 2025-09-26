using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.API.Models;
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
        public async Task<ActionResult<IEnumerable<MediaTask>>> GetAllTasks()
        {
            try
            {
                var tasks = await _mediaTaskService.GetAllTasksAsync();
                return Ok(tasks);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MediaTask>> GetTaskById(int id)
        {
            try
            {
                var task = await _mediaTaskService.GetTaskByIdAsync(id);
                if (task == null)
                {
                    return NotFound($"Task with ID {id} not found.");
                }
                return Ok(task);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<MediaTask>> CreateTask([FromBody] MediaTask task)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdTask = await _mediaTaskService.CreateTaskAsync(task);
                return CreatedAtAction(nameof(GetTaskById), new { id = createdTask.MediaTaskId }, createdTask);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<MediaTask>> UpdateTask(int id, [FromBody] MediaTask task)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedTask = await _mediaTaskService.UpdateTaskAsync(id, task);
                if (updatedTask == null)
                {
                    return NotFound($"Task with ID {id} not found.");
                }

                return Ok(updatedTask);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteTask(int id)
        {
            try
            {
                var isDeleted = await _mediaTaskService.DeleteTaskAsync(id);
                if (!isDeleted)
                {
                    return NotFound($"Task with ID {id} not found.");
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