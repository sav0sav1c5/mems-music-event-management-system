using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.EventOrganization.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LocationsController : ControllerBase
    {
        private readonly ILocationService _locationService;

        public LocationsController(ILocationService locationService)
        {
            _locationService = locationService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Location>>> GetAllLocations()
        {
            try
            {
                var locations = await _locationService.GetAllLocationsAsync();
                return Ok(locations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Location>> GetLocationById(int id)
        {
            try
            {
                var existingLocation = await _locationService.GetLocationByIdAsync(id);
                if (existingLocation == null)
                {
                    return NotFound($"Location with ID {id} not found.");
                }
                return Ok(existingLocation);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Location>> CreateLocation([FromBody] Location location)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdLocation = await _locationService.CreateLocationAsync(location);
                return CreatedAtAction(nameof(GetLocationById), new { id = createdLocation.Id }, createdLocation);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Location>> UpdateLocation(int id, [FromBody] Location location)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedLocation = await _locationService.UpdateLocationAsync(id, location);
                if (updatedLocation == null)
                {
                    return NotFound($"Location with ID {id} not found.");
                }
                return Ok(updatedLocation);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteLocation(int id)
        {
            try
            {
                var isDeleted = await _locationService.DeleteLocationAsync(id);
                if (!isDeleted)
                {
                    return NotFound($"Location with ID {id} not found.");
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