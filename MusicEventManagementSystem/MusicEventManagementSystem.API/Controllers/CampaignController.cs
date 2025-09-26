// MusicEventManagementSystem.API/Controllers/CampaignController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.API.Services.IService;
using MusicEventManagementSystem.Data;

namespace MusicEventManagementSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CampaignController : ControllerBase
    {
        private readonly ICampaignService _campaignService;

        public CampaignController(ICampaignService campaignService)
        {
            _campaignService = campaignService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Campaign>>> GetAllCampaigns()
        {
            try
            {
                var campaigns = await _campaignService.GetAllCampaignsAsync();
                return Ok(campaigns);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Campaign>> GetCampaignById(int id)
        {
            try
            {
                var campaign = await _campaignService.GetCampaignByIdAsync(id);
                if (campaign == null)
                {
                    return NotFound($"Campaign with ID {id} not found.");
                }
                return Ok(campaign);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Campaign>> CreateCampaign([FromBody] Campaign campaign)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdCampaign = await _campaignService.CreateCampaignAsync(campaign);
                return CreatedAtAction(nameof(GetCampaignById), new { id = createdCampaign.CampaignId }, createdCampaign);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Campaign>> UpdateCampaign(int id, [FromBody] Campaign campaign)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedCampaign = await _campaignService.UpdateCampaignAsync(id, campaign);
                if (updatedCampaign == null)
                {
                    return NotFound($"Campaign with ID {id} not found.");
                }

                return Ok(updatedCampaign);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteCampaign(int id)
        {
            try
            {
                var isDeleted = await _campaignService.DeleteCampaignAsync(id);
                if (!isDeleted)
                {
                    return NotFound($"Campaign with ID {id} not found.");
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