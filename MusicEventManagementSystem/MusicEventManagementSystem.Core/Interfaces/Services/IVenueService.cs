using MusicEventManagementSystem.Core.Models.Entities.TicketSales;
using MusicEventManagementSystem.Core.Models.DTOs.EventOrganization;

namespace MusicEventManagementSystem.Core.Interfaces.Services
{
    public interface IVenueService
    {
        Task<IEnumerable<VenueResponseDto>> GetAllVenuesAsync();
        Task<VenueResponseDto?> GetVenueByIdAsync(int id);
        Task<VenueResponseDto> CreateVenueAsync(VenueCreateDto createVenueDto);
        Task<VenueResponseDto?> UpdateVenueAsync(int id, VenueUpdateDto updateVenueDto);
        Task<bool> DeleteVenueAsync(int id);

        Task<IEnumerable<VenueResponseDto>> GetByCityAsync(string city);
        Task<IEnumerable<VenueResponseDto>> GetByCapacityRangeAsync(int min, int max);
        Task<IEnumerable<VenueResponseDto>> GetByEventIdAsync(int eventId);
        Task<IEnumerable<SegmentResponseDto>> GetSegmentsAsync(int venueId);
        Task<IEnumerable<PerformanceResponseDto>> GetPerformancesAsync(int venueId);

        Task<int> CalculateTotalCapacityAsync(int venueId);
    }
}