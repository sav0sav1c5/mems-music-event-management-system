using Microsoft.AspNetCore.Mvc;
<<<<<<< HEAD:MusicEventManagementSystem/MusicEventManagementSystem.API/Controllers/PerformanceResourceController.cs
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Services.IService;
using System.Collections.Generic;
using System.Threading.Tasks;
=======
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;
>>>>>>> fc7d1e8729b7d2d6668f9b466d7f35e20a9a6543:MusicEventManagementSystem/MusicEventManagementSystem.EventOrganization.API/Controllers/PerformanceResourceController.cs

namespace MusicEventManagementSystem.EventOrganization.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PerformanceResourceController : ControllerBase
    {
        private readonly IPerformanceResourceService _performanceResourceService;

        public PerformanceResourceController(IPerformanceResourceService performanceResourceService)
        {
            _performanceResourceService = performanceResourceService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PerformanceResource>>> GetAll()
        {
            var performanceResources = await _performanceResourceService.GetAllPerformanceResourcesAsync();
            return Ok(performanceResources);
        }

        [HttpGet("performance/{performanceId}")]
        public async Task<ActionResult<IEnumerable<PerformanceResource>>> GetByPerformanceId(int performanceId)
        {
            var performanceResources = await _performanceResourceService.GetPerformanceResourcesByPerformanceIdAsync(performanceId);
            return Ok(performanceResources);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PerformanceResource>> GetById(int id)
        {
            var performanceResource = await _performanceResourceService.GetPerformanceResourceByIdAsync(id);
            if (performanceResource == null)
                return NotFound();
            return Ok(performanceResource);
        }

        [HttpPost]
        public async Task<ActionResult<PerformanceResource>> Create(PerformanceResource performanceResource)
        {
            if (performanceResource == null)
                return BadRequest();

            var createdPerformanceResource = await _performanceResourceService.CreatePerformanceResourceAsync(performanceResource);
            return CreatedAtAction(nameof(GetById), new { id = createdPerformanceResource.Id }, createdPerformanceResource);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, PerformanceResource performanceResource)
        {
            if (performanceResource == null || id != performanceResource.Id)
                return BadRequest();

            var updatedPerformanceResource = await _performanceResourceService.UpdatePerformanceResourceAsync(id, performanceResource);
            if (updatedPerformanceResource == null)
                return NotFound();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _performanceResourceService.DeletePerformanceResourceAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }
    }
}
