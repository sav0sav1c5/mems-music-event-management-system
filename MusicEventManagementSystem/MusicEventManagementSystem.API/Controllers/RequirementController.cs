using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Services;
using MusicEventManagementSystem.API.Services.IService;
using MusicEventManagementSystem.API.DTOs;
using System;

namespace MusicEventManagementSystem.API.Controllers
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
        public async Task<ActionResult<IEnumerable<RequirementDto>>> GetAllRequirements()
        {
            try
            {
                var requirements = await _requirementService.GetAllRequirementsAsync();
                var requirementDtos = requirements.Select(r => new RequirementDto
                {
                    RequirementId = r.RequirementId,
                    Title = r.Title,
                    Description = r.Description,
                    IsRequired = r.IsRequired,
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt,
                    PhaseId = r.PhaseId
                });
                return Ok(requirementDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RequirementDto>> GetRequirementById(int id)
        {
            try
            {
                var existingRequirement = await _requirementService.GetRequirementByIdAsync(id);

                if (existingRequirement == null)
                {
                    return NotFound($"Requirement with ID {id} not found.");
                }

                var requirementDto = new RequirementDto
                {
                    RequirementId = existingRequirement.RequirementId,
                    Title = existingRequirement.Title,
                    Description = existingRequirement.Description,
                    IsRequired = existingRequirement.IsRequired,
                    CreatedAt = existingRequirement.CreatedAt,
                    UpdatedAt = existingRequirement.UpdatedAt,
                    PhaseId = existingRequirement.PhaseId
                };

                return Ok(requirementDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("phase/{phaseId}")]
        public async Task<ActionResult<IEnumerable<RequirementDto>>> GetRequirementsByPhaseId(int phaseId)
        {
            try
            {
                var requirements = await _requirementService.GetRequirementsByPhaseIdAsync(phaseId);
                var requirementDtos = requirements.Select(r => new RequirementDto
                {
                    RequirementId = r.RequirementId,
                    Title = r.Title,
                    Description = r.Description,
                    IsRequired = r.IsRequired,
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt,
                    PhaseId = r.PhaseId
                });
                return Ok(requirementDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<RequirementDto>> CreateRequirement([FromBody] CreateRequirementDto requirementDto)
        {
            try
            {
                if (requirementDto == null)
                {
                    return BadRequest("Request body is null or invalid");
                }
                
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Validate that the PhaseId exists
                var phaseExists = await _requirementService.ValidatePhaseExistsAsync(requirementDto.PhaseId);
                if (!phaseExists)
                {
                    return BadRequest($"Phase with ID {requirementDto.PhaseId} does not exist");
                }

                // Convert DTO to entity
                var requirement = new Requirement
                {
                    // Explicitly do NOT set RequirementId - let EF auto-generate it
                    Title = requirementDto.Title,
                    Description = requirementDto.Description,
                    IsRequired = requirementDto.IsRequired,
                    PhaseId = requirementDto.PhaseId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                // Debug: Log the entity ID before creation
                Console.WriteLine($"=== CREATING REQUIREMENT ===");
                Console.WriteLine($"RequirementId before creation: {requirement.RequirementId}");
                Console.WriteLine($"Title: {requirement.Title}");
                Console.WriteLine($"PhaseId: {requirement.PhaseId}");

                var createdRequirement = await _requirementService.CreateRequirementAsync(requirement);
                
                Console.WriteLine($"RequirementId after creation: {createdRequirement.RequirementId}");
                Console.WriteLine($"=== REQUIREMENT CREATED SUCCESSFULLY ===");

                var resultDto = new RequirementDto
                {
                    RequirementId = createdRequirement.RequirementId,
                    Title = createdRequirement.Title,
                    Description = createdRequirement.Description,
                    IsRequired = createdRequirement.IsRequired,
                    CreatedAt = createdRequirement.CreatedAt,
                    UpdatedAt = createdRequirement.UpdatedAt,
                    PhaseId = createdRequirement.PhaseId
                };

                return CreatedAtAction(nameof(GetRequirementById), new { id = createdRequirement.RequirementId }, resultDto);
            }
            catch (Exception ex)
            {
                // Log the full exception for debugging
                Console.WriteLine($"=== REQUIREMENT CREATION ERROR ===");
                Console.WriteLine($"Exception Type: {ex.GetType().Name}");
                Console.WriteLine($"Message: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                Console.WriteLine($"Inner Exception: {ex.InnerException?.Message}");
                Console.WriteLine($"================================");
                
                // Return user-friendly error message
                if (ex.InnerException?.Message.Contains("foreign key constraint") == true)
                {
                    return BadRequest($"Invalid Phase ID provided: {requirementDto.PhaseId}");
                }
                
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<RequirementDto>> UpdateRequirement(int id, [FromBody] UpdateRequirementDto requirementDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Convert DTO to entity
                var requirement = new Requirement
                {
                    RequirementId = id,
                    Title = requirementDto.Title,
                    Description = requirementDto.Description,
                    IsRequired = requirementDto.IsRequired,
                    PhaseId = requirementDto.PhaseId,
                    UpdatedAt = DateTime.UtcNow
                };

                var updatedRequirement = await _requirementService.UpdateRequirementAsync(id, requirement);

                if (updatedRequirement == null)
                {
                    return NotFound($"Requirement with ID {id} not found.");
                }

                var resultDto = new RequirementDto
                {
                    RequirementId = updatedRequirement.RequirementId,
                    Title = updatedRequirement.Title,
                    Description = updatedRequirement.Description,
                    IsRequired = updatedRequirement.IsRequired,
                    CreatedAt = updatedRequirement.CreatedAt,
                    UpdatedAt = updatedRequirement.UpdatedAt,
                    PhaseId = updatedRequirement.PhaseId
                };

                return Ok(resultDto);
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
