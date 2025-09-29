using MusicEventManagementSystem.Core.Enums.EventOrganization;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.Core.Interfaces.Repositories
{
    public interface IResourceRepository : IRepository<Resource>
    {
        Task<Resource?> GetByNameAsync(string name);
        Task<IEnumerable<Resource>> GetByTypeAsync(ResourceType type);
        Task<IEnumerable<Resource>> GetAvailableResourcesAsync();
    }
}