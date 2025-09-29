using MusicEventManagementSystem.Core.Enums.EventOrganization;
using MusicEventManagementSystem.Core.Models.DTOs.EventOrganization;

namespace MusicEventManagementSystem.Core.Interfaces.Services
{
    public interface IEventService
    {
        Task<IEnumerable<EventResponseDto>> GetAllEventsAsync();
        Task<EventResponseDto?> GetEventByIdAsync(int id);
        Task<EventResponseDto> CreateEventAsync(EventCreateDto eventDto);
        Task<EventResponseDto?> UpdateEventAsync(int id, EventUpdateDto eventDto);
        Task<bool> DeleteEventAsync(int id);

        Task<EventResponseDto?> GetByNameAsync(string name);
        Task<IEnumerable<EventResponseDto>> GetByStatusAsync(EventStatus status);
        Task<IEnumerable<EventResponseDto>> GetByDateRangeAsync(DateTime start, DateTime end);
        Task<IEnumerable<EventResponseDto>> GetByCreatedByIdAsync(Guid createdById);
    }
}