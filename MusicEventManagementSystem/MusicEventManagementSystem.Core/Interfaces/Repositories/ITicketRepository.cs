using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;

namespace MusicEventManagementSystem.Core.Interfaces.Repositories
{
    public interface ITicketRepository : IRepository<Ticket>
    {
        Task<IEnumerable<Ticket>> GetTicketsByStatusAsync(TicketStatus status);
        Task<Ticket?> GetTicketByUniqueCodeAsync(string uniqueCode);
        Task<Ticket?> GetTicketByQrCodeAsync(string qrCode);
        Task<IEnumerable<Ticket>> GetSoldTicketsAsync();
        Task<IEnumerable<Ticket>> GetTodaysTicketsAsync();

        // Analytics/Statistics methods
        Task<int> GetTicketsCountByStatusAsync(TicketStatus status);
        Task<decimal> GetTotalRevenueAsync();
        Task<decimal> GetRevenueByDateRangeAsync(DateTime fromDate, DateTime toDate);
        Task<decimal> GetRevenueByStatusAsync(TicketStatus status);
    }
}
