using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication;

namespace MusicEventManagementSystem.PerformerCommunication.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RequirementController : ControllerBase
    {
        private readonly IRequirementService _requirementService;

        public RequirementController(IRequirementService requirementService)
        {
            _requirementService = requirementService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Requirement>>> GetAllRequirements()
        {
            try
            {
                var requirements = await _requirementService.GetAllRequirementsAsync();
                return Ok(requirements);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Requirement>> GetRequirementById(int id)
        {
            try
            {
                var existingRequirement = await _requirementService.GetRequirementByIdAsync(id);

                if (existingRequirement == null)
                {
                    return NotFound($"Requirement with ID {id} not found.");
                }

                return Ok(existingRequirement);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Requirement>> CreateRequirement([FromBody] Requirement requirement)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdRequirement = await _requirementService.CreateRequirementAsync(requirement);

                return CreatedAtAction(nameof(GetRequirementById), new { id = createdRequirement.RequirementId }, createdRequirement);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Requirement>> UpdateRequirement(int id, [FromBody] Requirement requirement)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedRequirement = await _requirementService.UpdateRequirementAsync(id, requirement);

                if (updatedRequirement == null)
                {
                    return NotFound($"Requirement with ID {id} not found.");
                }

                return Ok(updatedRequirement);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteRequirement(int id)
        {
            try
            {
                var isDeleted = await _requirementService.DeleteRequirementAsync(id);

                if (isDeleted == false)
                {
                    return NotFound($"Requirement with ID {id} not found.");
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
