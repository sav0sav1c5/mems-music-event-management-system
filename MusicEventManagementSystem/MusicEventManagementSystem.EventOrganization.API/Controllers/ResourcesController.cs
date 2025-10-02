using AutoMapper;
using Microsoft.AspNetCore.Mvc;
<<<<<<< HEAD:MusicEventManagementSystem/MusicEventManagementSystem.API/Controllers/ResourcesController.cs
using MusicEventManagementSystem.API.DTOs;
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Services.IService;
=======
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;
>>>>>>> fc7d1e8729b7d2d6668f9b466d7f35e20a9a6543:MusicEventManagementSystem/MusicEventManagementSystem.EventOrganization.API/Controllers/ResourcesController.cs

namespace MusicEventManagementSystem.EventOrganization.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ResourcesController : ControllerBase
    {
        private readonly IResourceService _resourceService;
        private readonly IMapper _mapper;

        public ResourcesController(IResourceService resourceService, IMapper mapper)
        {
            _resourceService = resourceService;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ResourceResponseDto>>> GetAllResources()
        {
            try
            {
                var resources = await _resourceService.GetAllResourcesAsync();
                var response = _mapper.Map<IEnumerable<ResourceResponseDto>>(resources);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ResourceResponseDto>> GetResourceById(int id)
        {
            try
            {
                var existingResource = await _resourceService.GetResourceByIdAsync(id);
                if (existingResource == null)
                {
                    return NotFound($"Resource with ID {id} not found.");
                }

                var response = _mapper.Map<ResourceResponseDto>(existingResource);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<ResourceResponseDto>> CreateResource([FromBody] ResourceCreateDto resourceDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var resource = _mapper.Map<Resource>(resourceDto);
                var createdResource = await _resourceService.CreateResourceAsync(resource);
                var response = _mapper.Map<ResourceResponseDto>(createdResource);
                return CreatedAtAction(nameof(GetResourceById), new { id = response.Id }, response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ResourceResponseDto>> UpdateResource(int id, [FromBody] ResourceUpdateDto resourceDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var resource = _mapper.Map<Resource>(resourceDto);
                var updatedResource = await _resourceService.UpdateResourceAsync(id, resource);
                if (updatedResource == null)
                {
                    return NotFound($"Resource with ID {id} not found.");
                }

                var response = _mapper.Map<ResourceResponseDto>(updatedResource);
                return Ok(response);
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
