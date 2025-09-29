using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;

namespace MusicEventManagementSystem.Core.Interfaces.Services
{
    public interface ITicketService
    {
        Task<IEnumerable<TicketResponseDto>> GetAllTicketsAsync();
        Task<TicketResponseDto?> GetTicketByIdAsync(int id);
        Task<TicketResponseDto> CreateTicketAsync(TicketCreateDto ticketDto);
        Task<TicketResponseDto?> UpdateTicketAsync(int id, TicketUpdateDto ticketDto);
        Task<bool> DeleteTicketAsync(int id);

        Task<IEnumerable<TicketResponseDto>> GetTicketsByStatusAsync(TicketStatus status);
        Task<TicketResponseDto?> GetTicketByUniqueCodeAsync(string uniqueCode);
        Task<TicketResponseDto?> GetTicketByQrCodeAsync(string qrCode);

        Task<int> GetTicketsCountByStatusAsync(TicketStatus status);
        Task<decimal> GetTotalRevenueAsync();
        Task<decimal> GetRevenueByDateRangeAsync(DateTime from, DateTime to);
        Task<decimal> GetRevenueByStatusAsync(TicketStatus status);
        Task<IEnumerable<TicketResponseDto>> GetSoldTicketsAsync();
        Task<IEnumerable<TicketResponseDto>> GetTodaysTicketsAsync();

        // Ticket lifecycle methods
        Task<TicketResponseDto?> SellTicketAsync(int ticketId);
        Task<TicketResponseDto?> UseTicketAsync(string uniqueCode);
        Task<TicketResponseDto?> CancelTicketAsync(int ticketId);

        // Validation methods
        Task<bool> IsUniqueCodeValidAsync(string uniqueCode);
        Task<bool> IsQrCodeValidAsync(string qrCode);
        Task<bool> CanTicketBeUsedAsync(string uniqueCode);
    }
}
