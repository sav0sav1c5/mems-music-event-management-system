using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Services.IService;

namespace MusicEventManagementSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MediaWorkflowController : ControllerBase
    {
        private readonly IMediaWorkflowService _mediaWorkflowService;

        public MediaWorkflowController(IMediaWorkflowService mediaWorkflowService)
        {
            _mediaWorkflowService = mediaWorkflowService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MediaWorkflow>>> GetAllWorkflows()
        {
            try
            {
                var workflows = await _mediaWorkflowService.GetAllWorkflowsAsync();
                return Ok(workflows);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MediaWorkflow>> GetWorkflowById(int id)
        {
            try
            {
                var workflow = await _mediaWorkflowService.GetWorkflowByIdAsync(id);
                if (workflow == null)
                {
                    return NotFound($"Workflow with ID {id} not found.");
                }
                return Ok(workflow);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<MediaWorkflow>> CreateWorkflow([FromBody] MediaWorkflow workflow)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdWorkflow = await _mediaWorkflowService.CreateWorkflowAsync(workflow);
                return CreatedAtAction(nameof(GetWorkflowById), new { id = createdWorkflow.MediaWorkflowId }, createdWorkflow);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<MediaWorkflow>> UpdateWorkflow(int id, [FromBody] MediaWorkflow workflow)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedWorkflow = await _mediaWorkflowService.UpdateWorkflowAsync(id, workflow);
                if (updatedWorkflow == null)
                {
                    return NotFound($"Workflow with ID {id} not found.");
                }

                return Ok(updatedWorkflow);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteWorkflow(int id)
        {
            try
            {
                var isDeleted = await _mediaWorkflowService.DeleteWorkflowAsync(id);
                if (!isDeleted)
                {
                    return NotFound($"Workflow with ID {id} not found.");
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