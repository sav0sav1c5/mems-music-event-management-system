using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.Core.Interfaces.Repositories
{
    public interface IServiceRepository : IRepository<Service>
    {
        Task<Service?> GetByProviderAsync(string provider);
    }
}