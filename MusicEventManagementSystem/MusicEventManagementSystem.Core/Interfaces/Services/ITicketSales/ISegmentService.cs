using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;

namespace MusicEventManagementSystem.Core.Interfaces.Services.ITicketSales
{
    public interface ISegmentService
    {
        Task<IEnumerable<SegmentResponseDto>> GetAllSegmentsAsync();
        Task<SegmentResponseDto?> GetSegmentByIdAsync(int id);
        Task<SegmentResponseDto> CreateSegmentAsync(SegmentCreateDto createSegmentDto);
        Task<SegmentResponseDto?> UpdateSegmentAsync(int id, SegmentUpdateDto updateSegmentDto);
        Task<bool> DeleteSegmentAsync(int id);

        Task<IEnumerable<SegmentResponseDto>> GetByVenueIdAsync(int venueId);
        Task<IEnumerable<SegmentResponseDto>> GetBySegmentTypeAsync(SegmentType segmentType);
        Task<IEnumerable<ZoneResponseDto>> GetZonesAsync(int segmentId);
        Task<int> CalculateTotalCapacityAsync(int segmentId);
    }
}
