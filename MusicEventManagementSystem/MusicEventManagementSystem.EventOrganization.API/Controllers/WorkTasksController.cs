using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.EventOrganization.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkTasksController : ControllerBase
    {
        private readonly IWorkTaskService _workTaskService;

        public WorkTasksController(IWorkTaskService workTaskService)
        {
            _workTaskService = workTaskService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<WorkTask>>> GetAllWorkTasks()
        {
            try
            {
                var workTasks = await _workTaskService.GetAllWorkTasksAsync();
                return Ok(workTasks);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<WorkTask>> GetWorkTaskById(int id)
        {
            try
            {
                var existingWorkTask = await _workTaskService.GetWorkTaskByIdAsync(id);
                if (existingWorkTask == null)
                {
                    return NotFound($"WorkTask with ID {id} not found.");
                }
                return Ok(existingWorkTask);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<WorkTask>> CreateWorkTask([FromBody] WorkTask workTask)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdWorkTask = await _workTaskService.CreateWorkTaskAsync(workTask);
                return CreatedAtAction(nameof(GetWorkTaskById), new { id = createdWorkTask.Id }, createdWorkTask);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<WorkTask>> UpdateWorkTask(int id, [FromBody] WorkTask workTask)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedWorkTask = await _workTaskService.UpdateWorkTaskAsync(id, workTask);
                if (updatedWorkTask == null)
                {
                    return NotFound($"WorkTask with ID {id} not found.");
                }
                return Ok(updatedWorkTask);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteWorkTask(int id)
        {
            try
            {
                var isDeleted = await _workTaskService.DeleteWorkTaskAsync(id);
                if (!isDeleted)
                {
                    return NotFound($"WorkTask with ID {id} not found.");
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