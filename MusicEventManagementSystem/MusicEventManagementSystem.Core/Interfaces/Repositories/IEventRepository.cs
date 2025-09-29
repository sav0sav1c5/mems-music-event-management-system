using MusicEventManagementSystem.Core.Enums.EventOrganization;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.Core.Interfaces.Repositories
{
    public interface IEventRepository : IRepository<Event>
    {
        Task<Event?> GetByNameAsync(string name);
        Task<IEnumerable<Event>> GetByStatusAsync(EventStatus status);
        //Task<IEnumerable<Event>> GetByDateRangeAsync(DateTime start, DateTime end);
        Task<IEnumerable<Event>> GetByCreatedByIdAsync(Guid createdById);
    }
}