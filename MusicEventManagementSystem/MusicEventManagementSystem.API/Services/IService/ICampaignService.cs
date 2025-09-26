// MusicEventManagementSystem.API/Services/IServices/ICampaignService.cs
using MusicEventManagementSystem.API.Models;

namespace MusicEventManagementSystem.API.Services.IService
{
    public interface ICampaignService
    {
        Task<IEnumerable<Campaign>> GetAllCampaignsAsync();
        Task<Campaign?> GetCampaignByIdAsync(int id);
        Task<Campaign> CreateCampaignAsync(Campaign campaign);
        Task<Campaign?> UpdateCampaignAsync(int id, Campaign campaign);
        Task<bool> DeleteCampaignAsync(int id);
    }
}