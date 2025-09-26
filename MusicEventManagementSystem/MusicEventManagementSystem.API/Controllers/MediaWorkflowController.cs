using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.API.DTOs.MediaCampaign;
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
        public async Task<ActionResult<IEnumerable<MediaWorkflowResponseDto>>> GetAllMediaWorkflows()
        {
            try
            {
                var workflows = await _mediaWorkflowService.GetAllMediaWorkflowsAsync();
                return Ok(workflows);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MediaWorkflowResponseDto>> GetMediaWorkflowById(int id)
        {
            try
            {
                var workflow = await _mediaWorkflowService.GetMediaWorkflowByIdAsync(id);
                if (workflow == null)
                    return NotFound($"MediaWorkflow with ID {id} not found.");
                return Ok(workflow);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<MediaWorkflowResponseDto>> CreateMediaWorkflow([FromBody] MediaWorkflowCreateDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var createdWorkflow = await _mediaWorkflowService.CreateMediaWorkflowAsync(createDto);
                return CreatedAtAction(nameof(GetMediaWorkflowById), new { id = createdWorkflow.MediaWorkflowId }, createdWorkflow);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<MediaWorkflowResponseDto>> UpdateMediaWorkflow(int id, [FromBody] MediaWorkflowUpdateDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var updatedWorkflow = await _mediaWorkflowService.UpdateMediaWorkflowAsync(id, updateDto);
                if (updatedWorkflow == null)
                    return NotFound($"MediaWorkflow with ID {id} not found.");
                return Ok(updatedWorkflow);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteMediaWorkflow(int id)
        {
            try
            {
                var isDeleted = await _mediaWorkflowService.DeleteMediaWorkflowAsync(id);
                if (!isDeleted)
                    return NotFound($"MediaWorkflow with ID {id} not found.");
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}