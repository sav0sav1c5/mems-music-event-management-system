using MusicEventManagementSystem.Core.Models.Entities.TicketSales;

namespace MusicEventManagementSystem.Core.Interfaces.Repositories
{
    public interface IVenueRepository : IRepository<Venue>
    {
        Task<IEnumerable<Venue>> GetByCityAsync(string city);
        Task<IEnumerable<Venue>> GetByCapacityRangeAsync(int min, int max);
        Task<IEnumerable<Segment>> GetSegmentsAsync(int venueId);
    }
}
