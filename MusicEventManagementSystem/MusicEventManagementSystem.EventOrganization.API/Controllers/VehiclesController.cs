using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.EventOrganization.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VehiclesController : ControllerBase
    {
        private readonly IVehicleService _vehicleService;

        public VehiclesController(IVehicleService vehicleService)
        {
            _vehicleService = vehicleService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Vehicle>>> GetAllVehicles()
        {
            try
            {
                var vehicles = await _vehicleService.GetAllVehiclesAsync();
                return Ok(vehicles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Vehicle>> GetVehicleById(int id)
        {
            try
            {
                var existingVehicle = await _vehicleService.GetVehicleByIdAsync(id);
                if (existingVehicle == null)
                {
                    return NotFound($"Vehicle with ID {id} not found.");
                }
                return Ok(existingVehicle);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Vehicle>> CreateVehicle([FromBody] VehicleResourceDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var vehicle = new Vehicle
                {
                    VehicleType = dto.VehicleType,
                    LicensePlate = dto.LicensePlate,
                    Capacity = dto.Capacity,
                    DriverRequired = dto.DriverRequired,
                    FuelType = dto.FuelType
                };
                var resource = new Resource
                {
                    Name = dto.ResourceName,
                    Type = dto.ResourceType,
                    Description = dto.ResourceDescription,
                    Quantity = 1,
                    IsAvailable = true
                };
                var createdVehicle = await _vehicleService.CreateVehicleAsync(vehicle, resource);
                return CreatedAtAction(nameof(GetVehicleById), new { id = createdVehicle.Id }, createdVehicle);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Vehicle>> UpdateVehicle(int id, [FromBody] Vehicle vehicle)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedVehicle = await _vehicleService.UpdateVehicleAsync(id, vehicle);
                if (updatedVehicle == null)
                {
                    return NotFound($"Vehicle with ID {id} not found.");
                }
                return Ok(updatedVehicle);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteVehicle(int id)
        {
            try
            {
                var isDeleted = await _vehicleService.DeleteVehicleAsync(id);
                if (!isDeleted)
                {
                    return NotFound($"Vehicle with ID {id} not found.");
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