using MusicEventManagementSystem.API.Models;

namespace MusicEventManagementSystem.API.Services.IService
{
    public interface IMediaVersionService
    {
        Task<IEnumerable<MediaVersion>> GetAllVersionsAsync();
        Task<MediaVersion?> GetVersionByIdAsync(int id);
        Task<MediaVersion> CreateVersionAsync(MediaVersion mediaVersion);
        Task<MediaVersion?> UpdateVersionAsync(int id, MediaVersion mediaVersion);
        Task<bool> DeleteVersionAsync(int id);
    }
}