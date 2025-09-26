using MusicEventManagementSystem.API.Models;

namespace MusicEventManagementSystem.API.Services.IService
{
    public interface IAdService
    {
        Task<IEnumerable<Ad>> GetAllAdsAsync();
        Task<Ad?> GetAdByIdAsync(int id);
        Task<Ad> CreateAdAsync(Ad ad);
        Task<Ad?> UpdateAdAsync(int id, Ad ad);
        Task<bool> DeleteAdAsync(int id);
    }
}