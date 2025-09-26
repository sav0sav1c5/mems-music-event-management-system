using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.API.DTOs.MediaCampaign;
using MusicEventManagementSystem.API.Services.IService;

namespace MusicEventManagementSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ApprovalController : ControllerBase
    {
        private readonly IApprovalService _approvalService;

        public ApprovalController(IApprovalService approvalService)
        {
            _approvalService = approvalService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ApprovalResponseDto>>> GetAllApprovals()
        {
            try
            {
                var approvals = await _approvalService.GetAllApprovalsAsync();
                return Ok(approvals);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApprovalResponseDto>> GetApprovalById(int id)
        {
            try
            {
                var approval = await _approvalService.GetApprovalByIdAsync(id);
                if (approval == null)
                    return NotFound($"Approval with ID {id} not found.");
                return Ok(approval);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<ApprovalResponseDto>> CreateApproval([FromBody] ApprovalCreateDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var createdApproval = await _approvalService.CreateApprovalAsync(createDto);
                return CreatedAtAction(nameof(GetApprovalById), new { id = createdApproval.ApprovalId }, createdApproval);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ApprovalResponseDto>> UpdateApproval(int id, [FromBody] ApprovalUpdateDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var updatedApproval = await _approvalService.UpdateApprovalAsync(id, updateDto);
                if (updatedApproval == null)
                    return NotFound($"Approval with ID {id} not found.");
                return Ok(updatedApproval);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteApproval(int id)
        {
            try
            {
                var isDeleted = await _approvalService.DeleteApprovalAsync(id);
                if (!isDeleted)
                    return NotFound($"Approval with ID {id} not found.");
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}