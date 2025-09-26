using MusicEventManagementSystem.API.DTOs.MediaCampaign;
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Models;

namespace MusicEventManagementSystem.API.Services.IService
{
    public interface IAdTypeService
    {
        Task<IEnumerable<AdTypeResponseDto>> GetAllAdTypesAsync();
        Task<AdTypeResponseDto?> GetAdTypeByIdAsync(int id);
        Task<AdTypeResponseDto> CreateAdTypeAsync(AdTypeCreateDto createDto);
        Task<AdTypeResponseDto?> UpdateAdTypeAsync(int id, AdTypeUpdateDto updateDto);
        Task<bool> DeleteAdTypeAsync(int id);
    }
}