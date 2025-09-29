using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.EventOrganization.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ResourcesController : ControllerBase
    {
        private readonly IResourceService _resourceService;

        public ResourcesController(IResourceService resourceService)
        {
            _resourceService = resourceService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Resource>>> GetAllResources()
        {
            try
            {
                var resources = await _resourceService.GetAllResourcesAsync();
                return Ok(resources);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Resource>> GetResourceById(int id)
        {
            try
            {
                var existingResource = await _resourceService.GetResourceByIdAsync(id);
                if (existingResource == null)
                {
                    return NotFound($"Resource with ID {id} not found.");
                }
                return Ok(existingResource);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Resource>> CreateResource([FromBody] Resource resource)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdResource = await _resourceService.CreateResourceAsync(resource);
                return CreatedAtAction(nameof(GetResourceById), new { id = createdResource.Id }, createdResource);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Resource>> UpdateResource(int id, [FromBody] Resource resource)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedResource = await _resourceService.UpdateResourceAsync(id, resource);
                if (updatedResource == null)
                {
                    return NotFound($"Resource with ID {id} not found.");
                }
                return Ok(updatedResource);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteResource(int id)
        {
            try
            {
                var isDeleted = await _resourceService.DeleteResourceAsync(id);
                if (!isDeleted)
                {
                    return NotFound($"Resource with ID {id} not found.");
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