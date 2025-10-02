using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;

namespace MusicEventManagementSystem.Core.Interfaces.Services
{
    public interface ITicketTypeService
    {
        Task<IEnumerable<TicketTypeResponseDto>> GetAllTicketTypesAsync();
        Task<TicketTypeResponseDto?> GetTicketTypeByIdAsync(int id);
        Task<TicketTypeResponseDto> CreateTicketTypeAsync(TicketTypeCreateDto createDto);
        Task<TicketTypeResponseDto?> UpdateTicketTypeAsync(int id, TicketTypeUpdateDto updateDto);
        Task<bool> DeleteTicketTypeAsync(int id);

        Task<IEnumerable<TicketTypeResponseDto>> GetByZoneIdAsync(int zoneId);
        Task<IEnumerable<TicketTypeResponseDto>> GetByEventIdAsync(int eventId);
        Task<IEnumerable<TicketTypeResponseDto>> GetByStatusAsync(TicketTypeStatus status);
        Task<IEnumerable<TicketTypeResponseDto>> GetAvailableTicketTypesAsync();
        Task<bool> UpdateAvailableQuantityAsync(int id, int quantity);
        Task<IEnumerable<TicketTypeResponseDto>> GetByZoneAndEventAsync(int zoneId, int eventId);
        Task<int> GetTotalAvailableQuantityByEventAsync(int eventId);
        Task<bool> ReserveTicketsAsync(int ticketTypeId, int quantity);
        Task<bool> ReleaseTicketsAsync(int ticketTypeId, int quantity);
    }
}
