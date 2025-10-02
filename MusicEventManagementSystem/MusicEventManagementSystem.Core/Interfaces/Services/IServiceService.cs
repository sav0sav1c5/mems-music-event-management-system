using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.Core.Interfaces.Services
{
    public interface IServiceService
    {
        Task<IEnumerable<Service>> GetAllServicesAsync();
        Task<Service?> GetServiceByIdAsync(int id);
        Task<Service> CreateServiceAsync(Service service, Resource resource);
        Task<Service?> UpdateServiceAsync(int id, Service service);
        Task<bool> DeleteServiceAsync(int id);
    }
}