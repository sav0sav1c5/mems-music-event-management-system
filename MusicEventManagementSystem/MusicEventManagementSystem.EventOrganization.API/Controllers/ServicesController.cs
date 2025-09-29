using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.EventOrganization.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServicesController : ControllerBase
    {
        private readonly IServiceService _serviceService;

        public ServicesController(IServiceService serviceService)
        {
            _serviceService = serviceService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Service>>> GetAllServices()
        {
            try
            {
                var services = await _serviceService.GetAllServicesAsync();
                return Ok(services);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Service>> GetServiceById(int id)
        {
            try
            {
                var existingService = await _serviceService.GetServiceByIdAsync(id);
                if (existingService == null)
                {
                    return NotFound($"Service with ID {id} not found.");
                }
                return Ok(existingService);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Service>> CreateService([FromBody] ServiceResourceDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var service = new Service
                {
                    Provider = dto.Provider,
                    Contact = dto.Contact,
                    ContractSigned = dto.ContractSigned,
                    ServiceDuration = dto.ServiceDuration
                };
                var resource = new Resource
                {
                    Name = dto.ResourceName,
                    Type = dto.ResourceType,
                    Description = dto.ResourceDescription,
                    Quantity = 1,
                    IsAvailable = true
                };
                var createdService = await _serviceService.CreateServiceAsync(service, resource);
                return CreatedAtAction(nameof(GetServiceById), new { id = createdService.Id }, createdService);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Service>> UpdateService(int id, [FromBody] Service service)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedService = await _serviceService.UpdateServiceAsync(id, service);
                if (updatedService == null)
                {
                    return NotFound($"Service with ID {id} not found.");
                }
                return Ok(updatedService);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteService(int id)
        {
            try
            {
                var isDeleted = await _serviceService.DeleteServiceAsync(id);
                if (!isDeleted)
                {
                    return NotFound($"Service with ID {id} not found.");
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