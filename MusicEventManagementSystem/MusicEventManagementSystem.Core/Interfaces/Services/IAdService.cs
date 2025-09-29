using MusicEventManagementSystem.Core.Models.Entities.MediaCampaign;

namespace MusicEventManagementSystem.Core.Interfaces.Services
{
    public interface IAdService
    {
        Task<IEnumerable<AdResponseDto>> GetAllAdsAsync();
        Task<AdResponseDto?> GetAdByIdAsync(int id);
        Task<AdResponseDto> CreateAdAsync(AdCreateDto createDto);
        Task<AdResponseDto?> UpdateAdAsync(int id, AdUpdateDto updateDto);
        Task<bool> DeleteAdAsync(int id);
    }
}