using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.Core.Interfaces.Services
{
    public interface IResourceService
    {
        Task<IEnumerable<Resource>> GetAllResourcesAsync();
        Task<Resource?> GetResourceByIdAsync(int id);
        Task<Resource> CreateResourceAsync(Resource resource);
        Task<Resource?> UpdateResourceAsync(int id, Resource resource);
        Task<bool> DeleteResourceAsync(int id);
    }
}