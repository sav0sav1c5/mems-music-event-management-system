using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.EventOrganization.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InfrastructuresController : ControllerBase
    {
        private readonly IInfrastructureService _infrastructureService;

        public InfrastructuresController(IInfrastructureService infrastructureService)
        {
            _infrastructureService = infrastructureService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventInfrastructure>>> GetAllInfrastructures()
        {
            try
            {
                var infrastructures = await _infrastructureService.GetAllInfrastructuresAsync();
                return Ok(infrastructures);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EventInfrastructure>> GetInfrastructureById(int id)
        {
            try
            {
                var existingInfrastructure = await _infrastructureService.GetInfrastructureByIdAsync(id);
                if (existingInfrastructure == null)
                {
                    return NotFound($"Infrastructure with ID {id} not found.");
                }
                return Ok(existingInfrastructure);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<EventInfrastructure>> CreateInfrastructure([FromBody] InfrastructureResourceDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var infrastructure = new EventInfrastructure
                {
                    Size = dto.Size,
                    Weight = dto.Weight,
                    SetupTime = dto.SetupTime
                };
                var resource = new Resource
                {
                    Name = dto.ResourceName,
                    Type = dto.ResourceType,
                    Description = dto.ResourceDescription,
                    Quantity = 1,
                    IsAvailable = true
                };
                var createdInfrastructure = await _infrastructureService.CreateInfrastructureAsync(infrastructure, resource);
                return CreatedAtAction(nameof(GetInfrastructureById), new { id = createdInfrastructure.Id }, createdInfrastructure);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<EventInfrastructure>> UpdateInfrastructure(int id, [FromBody] EventInfrastructure infrastructure)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedInfrastructure = await _infrastructureService.UpdateInfrastructureAsync(id, infrastructure);
                if (updatedInfrastructure == null)
                {
                    return NotFound($"Infrastructure with ID {id} not found.");
                }
                return Ok(updatedInfrastructure);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteInfrastructure(int id)
        {
            try
            {
                var isDeleted = await _infrastructureService.DeleteInfrastructureAsync(id);
                if (!isDeleted)
                {
                    return NotFound($"Infrastructure with ID {id} not found.");
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