using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.EventOrganization.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffController : ControllerBase
    {
        private readonly IStaffService _staffService;

        public StaffController(IStaffService staffService)
        {
            _staffService = staffService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Staff>>> GetAllStaff()
        {
            try
            {
                var staff = await _staffService.GetAllStaffAsync();
                return Ok(staff);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Staff>> GetStaffById(int id)
        {
            try
            {
                var existingStaff = await _staffService.GetStaffByIdAsync(id);
                if (existingStaff == null)
                {
                    return NotFound($"Staff with ID {id} not found.");
                }
                return Ok(existingStaff);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Staff>> CreateStaff([FromBody] StaffResourceDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var staff = new Staff
                {
                    Role = dto.Role,
                    RequiredSkillLevel = dto.RequiredSkillLevel
                };
                var resource = new Resource
                {
                    Name = dto.ResourceName,
                    Type = dto.ResourceType,
                    Description = dto.ResourceDescription,
                    Quantity = 1,
                    IsAvailable = true
                };
                var createdStaff = await _staffService.CreateStaffAsync(staff, resource);
                return CreatedAtAction(nameof(GetStaffById), new { id = createdStaff.Id }, createdStaff);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Staff>> UpdateStaff(int id, [FromBody] Staff staff)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedStaff = await _staffService.UpdateStaffAsync(id, staff);
                if (updatedStaff == null)
                {
                    return NotFound($"Staff with ID {id} not found.");
                }
                return Ok(updatedStaff);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteStaff(int id)
        {
            try
            {
                var isDeleted = await _staffService.DeleteStaffAsync(id);
                if (!isDeleted)
                {
                    return NotFound($"Staff with ID {id} not found.");
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