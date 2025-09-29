using MusicEventManagementSystem.Core.Models.Entities.MediaCampaign;

namespace MusicEventManagementSystem.Core.Interfaces.Services
{
    public interface ICampaignService
    {
        Task<IEnumerable<CampaignResponseDto>> GetAllCampaignsAsync();
        Task<CampaignResponseDto?> GetCampaignByIdAsync(int id);
        Task<CampaignResponseDto> CreateCampaignAsync(CampaignCreateDto createDto);
        Task<CampaignResponseDto?> UpdateCampaignAsync(int id, CampaignUpdateDto updateDto);
        Task<bool> DeleteCampaignAsync(int id);
    }
}