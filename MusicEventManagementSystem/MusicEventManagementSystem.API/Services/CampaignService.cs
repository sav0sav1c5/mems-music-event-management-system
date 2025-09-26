// MusicEventManagementSystem.API/Services/CampaignService.cs
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.API.Services.IService;

namespace MusicEventManagementSystem.API.Services
{
    public class CampaignService : ICampaignService
    {
        private readonly ICampaignRepository _campaignRepository;

        public CampaignService(ICampaignRepository campaignRepository)
        {
            _campaignRepository = campaignRepository;
        }

        public async Task<IEnumerable<Campaign>> GetAllCampaignsAsync()
        {
            return await _campaignRepository.GetAllAsync();
        }

        public async Task<Campaign?> GetCampaignByIdAsync(int id)
        {
            return await _campaignRepository.GetByIdAsync(id);
        }

        public async Task<Campaign> CreateCampaignAsync(Campaign campaign)
        {
            await _campaignRepository.AddAsync(campaign);
            await _campaignRepository.SaveChangesAsync();
            return campaign;
        }

        public async Task<Campaign?> UpdateCampaignAsync(int id, Campaign campaign)
        {
            var existingCampaign = await _campaignRepository.GetByIdAsync(id);
            if (existingCampaign == null)
            {
                return null;
            }

            existingCampaign.EventId = campaign.EventId;
            existingCampaign.Name = campaign.Name;
            existingCampaign.StartDate = campaign.StartDate;
            existingCampaign.EndDate = campaign.EndDate;
            existingCampaign.TotalBudget = campaign.TotalBudget;

            _campaignRepository.Update(existingCampaign);
            await _campaignRepository.SaveChangesAsync();
            return existingCampaign;
        }

        public async Task<bool> DeleteCampaignAsync(int id)
        {
            var campaign = await _campaignRepository.GetByIdAsync(id);
            if (campaign == null)
            {
                return false;
            }

            _campaignRepository.Delete(campaign);
            await _campaignRepository.SaveChangesAsync();
            return true;
        }
    }
}