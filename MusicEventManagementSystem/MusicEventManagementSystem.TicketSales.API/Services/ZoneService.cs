using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Interfaces.Repositories.ITicketSales;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;

namespace MusicEventManagementSystem.TicketSales.API.Services
{
    public class ZoneService : IZoneService
    {
        private readonly IZoneRepository _zoneRepository;

        public ZoneService(IZoneRepository zoneRepository)
        {
            _zoneRepository = zoneRepository;
        }

        public async Task<IEnumerable<ZoneResponseDto>> GetAllZonesAsync()
        {
            var zones = await _zoneRepository.GetAllAsync();
            return zones.Select(MapToResponseDto);
        }

        public async Task<ZoneResponseDto?> GetZoneByIdAsync(int id)
        {
            var zone = await _zoneRepository.GetByIdAsync(id);
            
            if (zone == null)
            {
                return null;
            }

            return MapToResponseDto(zone);
        }

        public async Task<ZoneResponseDto> CreateZoneAsync(ZoneCreateDto createZoneDto)
        {
            var zone = MapToEntity(createZoneDto);

            await _zoneRepository.AddAsync(zone);
            await _zoneRepository.SaveChangesAsync();

            return MapToResponseDto(zone);
        }

        public async Task<ZoneResponseDto?> UpdateZoneAsync(int id, ZoneUpdateDto updateZoneDto)
        {
            var existingZone = await _zoneRepository.GetByIdAsync(id);

            if (existingZone == null)
            {
                return null;
            }

            if (!string.IsNullOrEmpty(updateZoneDto.Name))
                existingZone.Name = updateZoneDto.Name;

            if (updateZoneDto.Description != null)
                existingZone.Description = updateZoneDto.Description;

            if (updateZoneDto.Capacity.HasValue)
                existingZone.Capacity = updateZoneDto.Capacity.Value;

            if (updateZoneDto.BasePrice.HasValue)
                existingZone.BasePrice = updateZoneDto.BasePrice.Value;

            if (updateZoneDto.Position.HasValue)
                existingZone.Position = updateZoneDto.Position.Value;

            if (updateZoneDto.SegmentId.HasValue)
                existingZone.SegmentId = updateZoneDto.SegmentId.Value;

            _zoneRepository.Update(existingZone);
            await _zoneRepository.SaveChangesAsync();

            return MapToResponseDto(existingZone);
        }

        public async Task<bool> DeleteZoneAsync(int id)
        {
            var zone = await _zoneRepository.GetByIdAsync(id);
            
            if (zone == null)
            {
                return false;
            }

            _zoneRepository.Delete(zone);
            await _zoneRepository.SaveChangesAsync();
            return true;
        }


        public async Task<IEnumerable<ZoneResponseDto>> GetBySegmentIdAsync(int segmentId)
        {
            var zones = await _zoneRepository.GetBySegmentIdAsync(segmentId);
            return zones.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<ZoneResponseDto>> GetByPriceRangeAsync(decimal min, decimal max)
        {
            var zones = await _zoneRepository.GetByPriceRangeAsync(min, max);
            return zones.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<ZoneResponseDto>> GetByPositionAsync(ZonePosition position)
        {
            var zones = await _zoneRepository.GetByPositionAsync(position);
            return zones.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<TicketTypeResponseDto>> GetTicketTypesAsync(int zoneId)
        {
            var ticketTypes = await _zoneRepository.GetTicketTypesAsync(zoneId);
            return ticketTypes.Select(tt => new TicketTypeResponseDto
            {
                TicketTypeId = tt.TicketTypeId,
                Name = tt.Name,
                Description = tt.Description,
                AvailableQuantity = tt.AvailableQuantity,
                Status = tt.Status,
                ZoneId = tt.ZoneId,
                EventId = tt.EventId
            });
        }

        // Helper methods for mapping

        private static ZoneResponseDto MapToResponseDto(Zone zone)
        {
            return new ZoneResponseDto
            {
                ZoneId = zone.ZoneId,
                Name = zone.Name,
                Description = zone.Description,
                Capacity = zone.Capacity,
                BasePrice = zone.BasePrice,
                Position = zone.Position,
                SegmentId = zone.SegmentId,
                TicketTypeIds = zone.TicketTypes?.Select(tt => tt.TicketTypeId).ToList()
            };
        }

        private static Zone MapToEntity(ZoneCreateDto dto)
        {
            return new Zone
            {
                Name = dto.Name,
                Description = dto.Description,
                Capacity = dto.Capacity,
                BasePrice = dto.BasePrice,
                Position = dto.Position,
                SegmentId = dto.SegmentId
            };
        }
    }
}
