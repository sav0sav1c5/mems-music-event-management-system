using MusicEventManagementSystem.Core.Models.Entities.MediaCampaign;

namespace MusicEventManagementSystem.Core.Interfaces.Services
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