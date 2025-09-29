using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;

namespace MusicEventManagementSystem.Core.Interfaces.Repositories
{
    public interface ISegmentRepository : IRepository<Segment>
    {
        Task<IEnumerable<Segment>> GetByVenueIdAsync(int venueId);
        Task<IEnumerable<Segment>> GetBySegmentTypeAsync(SegmentType segmentType);
        Task<IEnumerable<Zone>> GetZonesAsync(int segmentId);
        Task<int> CalculateTotalCapacityAsync(int segmentId);
    }
}
