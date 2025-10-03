using MusicEventManagementSystem.Core.Models.DTOs.Client;

namespace MusicEventManagementSystem.API.Services.IServices
{
    public interface IClientVenueService
    {
        Task<IEnumerable<VenueInfoDto>> GetVenuesByCityAsync(string city);
        Task<VenueInfoDto?> GetVenueDetailsAsync(int venueId);
        Task<IEnumerable<ClientEventDto>> GetVenueEventsAsync(int venueId);
    }
}
