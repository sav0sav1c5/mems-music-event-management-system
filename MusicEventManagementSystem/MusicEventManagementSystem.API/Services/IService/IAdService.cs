using MusicEventManagementSystem.API.DTOs.MediaCampaign;
using MusicEventManagementSystem.API.Models;

namespace MusicEventManagementSystem.API.Services.IService
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