using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;

namespace MusicEventManagementSystem.Core.Interfaces.Repositories.ITicketSales
{
    public interface ITicketTypeRepository : IRepository<TicketType>
    {
        Task<IEnumerable<TicketType>> GetByZoneIdAsync(int zoneId);
        Task<IEnumerable<TicketType>> GetByEventIdAsync(int eventId);
        Task<IEnumerable<TicketType>> GetByStatusAsync(TicketTypeStatus status);
        Task<IEnumerable<TicketType>> GetAvailableTicketTypesAsync();
        Task<bool> UpdateAvailableQuantityAsync(int id, int quantity);
        Task<IEnumerable<TicketType>> GetByZoneAndEventAsync(int zoneId, int eventId);
        Task<int> GetTotalAvailableQuantityByEventAsync(int eventId);
        Task<IEnumerable<TicketType>> GetByIdsAsync(List<int> ids);
    }
}
