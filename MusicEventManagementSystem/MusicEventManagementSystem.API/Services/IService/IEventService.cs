using MusicEventManagementSystem.API.DTOs;
using MusicEventManagementSystem.API.Models;

namespace MusicEventManagementSystem.API.Services.IService
{
    public interface IEventService
    {
        Task<IEnumerable<EventResponseDto>> GetAllEventsAsync();
        Task<EventResponseDto?> GetEventByIdAsync(int id);
        Task<EventResponseDto> CreateEventAsync(EventCreateDto dto);
        Task<EventResponseDto?> UpdateEventAsync(int id, EventUpdateDto dto);
        Task<bool> DeleteEventAsync(int id);
    }
}
