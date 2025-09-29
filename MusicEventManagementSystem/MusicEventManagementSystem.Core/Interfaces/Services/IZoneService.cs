using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;

namespace MusicEventManagementSystem.Core.Interfaces.Services
{
    public interface IZoneService
    {
        Task<IEnumerable<ZoneResponseDto>> GetAllZonesAsync();
        Task<ZoneResponseDto?> GetZoneByIdAsync(int id);
        Task<ZoneResponseDto> CreateZoneAsync(ZoneCreateDto createZoneDto);
        Task<ZoneResponseDto?> UpdateZoneAsync(int id, ZoneUpdateDto updateZoneDto);
        Task<bool> DeleteZoneAsync(int id);

        Task<IEnumerable<ZoneResponseDto>> GetBySegmentIdAsync(int segmentId);
        Task<IEnumerable<ZoneResponseDto>> GetByPriceRangeAsync(decimal min, decimal max);
        Task<IEnumerable<ZoneResponseDto>> GetByPositionAsync(ZonePosition position);
        Task<IEnumerable<TicketTypeResponseDto>> GetTicketTypesAsync(int zoneId);
    }
}
