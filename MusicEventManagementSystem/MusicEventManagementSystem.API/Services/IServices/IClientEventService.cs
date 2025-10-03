using MusicEventManagementSystem.Core.Models.DTOs.Client;

namespace MusicEventManagementSystem.API.Services.IServices
{
    public interface IClientEventService
    {
        Task<IEnumerable<ClientEventDto>> GetUpcomingEventsAsync();
        Task<EventDetailsDto?> GetEventDetailsAsync(int eventId);
        Task<IEnumerable<ClientEventDto>> SearchEventsAsync(string? keyword, DateTime? startDate, DateTime? endDate);
        Task<IEnumerable<ClientEventDto>> GetEventsByPerformerAsync(int performerId);
        Task<IEnumerable<ClientEventDto>> GetEventsByCityAsync(string city);
        Task<IEnumerable<ClientEventDto>> GetFeaturedEventsAsync();
    }
}
