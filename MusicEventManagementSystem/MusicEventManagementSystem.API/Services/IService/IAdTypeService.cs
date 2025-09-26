using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Models;

namespace MusicEventManagementSystem.API.Services.IService
{
    public interface IAdTypeService
    {
        Task<IEnumerable<AdType>> GetAllAdTypesAsync();
        Task<AdType?> GetAdTypeByIdAsync(int id);
        Task<AdType> CreateAdTypeAsync(AdType adType);
        Task<AdType?> UpdateAdTypeAsync(int id, AdType adType);
        Task<bool> DeleteAdTypeAsync(int id);
    }
}