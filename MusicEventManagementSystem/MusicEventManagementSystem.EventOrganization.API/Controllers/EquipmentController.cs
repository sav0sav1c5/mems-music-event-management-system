using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.EventOrganization.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EquipmentController : ControllerBase
    {
        private readonly IEquipmentService _equipmentService;

        public EquipmentController(IEquipmentService equipmentService)
        {
            _equipmentService = equipmentService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Equipment>>> GetAllEquipment()
        {
            try
            {
                var equipment = await _equipmentService.GetAllEquipmentAsync();
                return Ok(equipment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Equipment>> GetEquipmentById(int id)
        {
            try
            {
                var existingEquipment = await _equipmentService.GetEquipmentByIdAsync(id);
                if (existingEquipment == null)
                {
                    return NotFound($"Equipment with ID {id} not found.");
                }
                return Ok(existingEquipment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Equipment>> CreateEquipment([FromBody] EquipmentResourceDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var equipment = new Equipment
                {
                    Model = dto.Model,
                    SerialNumber = dto.SerialNumber,
                    RequiresSetup = dto.RequiresSetup,
                    PowerRequirements = dto.PowerRequirements
                };
                var resource = new Resource
                {
                    Name = dto.ResourceName,
                    Type = dto.ResourceType,
                    Description = dto.ResourceDescription,
                    Quantity = 1,
                    IsAvailable = true
                };
                var createdEquipment = await _equipmentService.CreateEquipmentAsync(equipment, resource);
                return CreatedAtAction(nameof(GetEquipmentById), new { id = createdEquipment.Id }, createdEquipment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Equipment>> UpdateEquipment(int id, [FromBody] Equipment equipment)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedEquipment = await _equipmentService.UpdateEquipmentAsync(id, equipment);
                if (updatedEquipment == null)
                {
                    return NotFound($"Equipment with ID {id} not found.");
                }
                return Ok(updatedEquipment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteEquipment(int id)
        {
            try
            {
                var isDeleted = await _equipmentService.DeleteEquipmentAsync(id);
                if (!isDeleted)
                {
                    return NotFound($"Equipment with ID {id} not found.");
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