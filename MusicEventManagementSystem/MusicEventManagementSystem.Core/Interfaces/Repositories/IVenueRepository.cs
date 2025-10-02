using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;

namespace MusicEventManagementSystem.Core.Interfaces.Repositories
{
    public interface IVenueRepository : IRepository<Venue>
    {
        Task<IEnumerable<Venue>> GetByCityAsync(string city);
        Task<IEnumerable<Venue>> GetByCapacityRangeAsync(int min, int max);
        Task<IEnumerable<Venue>> GetByEventIdAsync(int eventId);
        Task<IEnumerable<Segment>> GetSegmentsAsync(int venueId);
        Task<IEnumerable<Performance>> GetPerformancesAsync(int venueId);
    }
}
