using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Services.IService;

namespace MusicEventManagementSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VersionController : ControllerBase
    {
        private readonly IMediaVersionService _versionService;

        public VersionController(IMediaVersionService versionService)
        {
            _versionService = versionService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MediaVersion>>> GetAllVersions()
        {
            try
            {
                var versions = await _versionService.GetAllVersionsAsync();
                return Ok(versions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MediaVersion>> GetVersionById(int id)
        {
            try
            {
                var version = await _versionService.GetVersionByIdAsync(id);
                if (version == null)
                {
                    return NotFound($"Version with ID {id} not found.");
                }
                return Ok(version);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<MediaVersion>> CreateVersion([FromBody] MediaVersion version)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdVersion = await _versionService.CreateVersionAsync(version);
                return CreatedAtAction(nameof(GetVersionById), new { id = createdVersion.MediaVersionId }, createdVersion);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<MediaVersion>> UpdateVersion(int id, [FromBody] MediaVersion version)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedVersion = await _versionService.UpdateVersionAsync(id, version);
                if (updatedVersion == null)
                {
                    return NotFound($"Version with ID {id} not found.");
                }

                return Ok(updatedVersion);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteVersion(int id)
        {
            try
            {
                var isDeleted = await _versionService.DeleteVersionAsync(id);
                if (!isDeleted)
                {
                    return NotFound($"Version with ID {id} not found.");
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