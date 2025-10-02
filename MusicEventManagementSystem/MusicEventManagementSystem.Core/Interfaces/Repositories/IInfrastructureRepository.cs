using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.Core.Interfaces.Repositories
{
    public interface IInfrastructureRepository
    {
        Task<IEnumerable<EventInfrastructure>> GetAllAsync();
        Task<EventInfrastructure?> GetByIdAsync(int id);
        Task AddAsync(EventInfrastructure infrastructure);
        void Update(EventInfrastructure infrastructure);
        void Delete(EventInfrastructure infrastructure);
        Task SaveChangesAsync();
    }
}