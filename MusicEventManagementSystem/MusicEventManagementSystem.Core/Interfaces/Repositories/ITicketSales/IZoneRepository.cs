using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;

namespace MusicEventManagementSystem.Core.Interfaces.Repositories.ITicketSales
{
    public interface IZoneRepository : IRepository<Zone>
    {
        Task<IEnumerable<Zone>> GetBySegmentIdAsync(int segmentId);
        Task<IEnumerable<Zone>> GetByPriceRangeAsync(decimal min, decimal max);
        Task<IEnumerable<Zone>> GetByPositionAsync(ZonePosition position);
        Task<IEnumerable<TicketType>> GetTicketTypesAsync(int zoneId);
    }
}
