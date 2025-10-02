using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.Core.Interfaces.Services
{
    public interface IInfrastructureService
    {
        Task<IEnumerable<EventInfrastructure>> GetAllInfrastructuresAsync();
        Task<EventInfrastructure?> GetInfrastructureByIdAsync(int id);
        Task<EventInfrastructure> CreateInfrastructureAsync(EventInfrastructure infrastructure, Resource resource);
        Task<EventInfrastructure?> UpdateInfrastructureAsync(int id, EventInfrastructure infrastructure);
        Task<bool> DeleteInfrastructureAsync(int id);
    }
}