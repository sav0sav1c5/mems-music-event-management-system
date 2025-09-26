using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.API.DTOs.MediaCampaign;
using MusicEventManagementSystem.API.Services.IService;

namespace MusicEventManagementSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class IntegrationStatusController : ControllerBase
    {
        private readonly IIntegrationStatusService _integrationStatusService;

        public IntegrationStatusController(IIntegrationStatusService integrationStatusService)
        {
            _integrationStatusService = integrationStatusService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<IntegrationStatusResponseDto>>> GetAllIntegrationStatuses()
        {
            try
            {
                var statuses = await _integrationStatusService.GetAllIntegrationStatusesAsync();
                return Ok(statuses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<IntegrationStatusResponseDto>> GetIntegrationStatusById(int id)
        {
            try
            {
                var status = await _integrationStatusService.GetIntegrationStatusByIdAsync(id);
                if (status == null)
                    return NotFound($"IntegrationStatus with ID {id} not found.");
                return Ok(status);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<IntegrationStatusResponseDto>> CreateIntegrationStatus([FromBody] IntegrationStatusCreateDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var createdStatus = await _integrationStatusService.CreateIntegrationStatusAsync(createDto);
                return CreatedAtAction(nameof(GetIntegrationStatusById), new { id = createdStatus.IntegrationStatusId }, createdStatus);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<IntegrationStatusResponseDto>> UpdateIntegrationStatus(int id, [FromBody] IntegrationStatusUpdateDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var updatedStatus = await _integrationStatusService.UpdateIntegrationStatusAsync(id, updateDto);
                if (updatedStatus == null)
                    return NotFound($"IntegrationStatus with ID {id} not found.");
                return Ok(updatedStatus);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteIntegrationStatus(int id)
        {
            try
            {
                var isDeleted = await _integrationStatusService.DeleteIntegrationStatusAsync(id);
                if (!isDeleted)
                    return NotFound($"IntegrationStatus with ID {id} not found.");
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}