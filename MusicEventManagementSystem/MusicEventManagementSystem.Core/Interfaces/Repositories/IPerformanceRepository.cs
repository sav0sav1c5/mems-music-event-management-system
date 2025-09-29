using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.Core.Interfaces.Repositories
{
    public interface IPerformanceRepository : IRepository<Performance>
    {
        Task<IEnumerable<Performance>> GetByEventIdAsync(int eventId);
        Task<IEnumerable<Performance>> GetByPerformerIdAsync(int performerId);
        Task<IEnumerable<Performance>> GetByVenueIdAsync(int venueId);
        Task<IEnumerable<Performance>> GetByDateRangeAsync(DateTime start, DateTime end);
    }
}