using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.Core.Interfaces.Repositories
{
    public interface ILocationRepository : IRepository<Location>
    {
        Task<Location?> GetByNameAsync(string name);
    }
}