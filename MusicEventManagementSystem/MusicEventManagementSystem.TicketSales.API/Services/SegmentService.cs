using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Interfaces.Repositories.ITicketSales;
using MusicEventManagementSystem.Core.Interfaces.Services.ITicketSales;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;

namespace MusicEventManagementSystem.TicketSales.API.Services
{
    public class SegmentService : ISegmentService
    {
        private readonly ISegmentRepository _segmentRepository;

        public SegmentService(ISegmentRepository segmentRepository)
        {
            _segmentRepository = segmentRepository;
        }

        public async Task<IEnumerable<SegmentResponseDto>> GetAllSegmentsAsync()
        {
            var segments = await _segmentRepository.GetAllAsync();
            return segments.Select(MapToResponseDto);
        }

        public async Task<SegmentResponseDto?> GetSegmentByIdAsync(int id)
        {
            var segment = await _segmentRepository.GetByIdAsync(id);
            
            if (segment == null)
            {
                return null;
            }
            
            return MapToResponseDto(segment);
        }

        public async Task<SegmentResponseDto> CreateSegmentAsync(SegmentCreateDto dto)
        {
            var segment = MapToEntity(dto);

            await _segmentRepository.AddAsync(segment);
            await _segmentRepository.SaveChangesAsync();

            return MapToResponseDto(segment);
        }

        public async Task<SegmentResponseDto?> UpdateSegmentAsync(int id, SegmentUpdateDto updateDto)
        {
            var existingSegment = await _segmentRepository.GetByIdAsync(id);

            if (existingSegment == null)
                return null;

            if (!string.IsNullOrEmpty(updateDto.Name))
                existingSegment.Name = updateDto.Name;

            if (updateDto.Description != null)
                existingSegment.Description = updateDto.Description;

            if (updateDto.Capacity.HasValue)
                existingSegment.Capacity = updateDto.Capacity.Value;

            if (updateDto.SegmentType.HasValue)
                existingSegment.SegmentType = updateDto.SegmentType.Value;

            if (updateDto.VenueId.HasValue)
                existingSegment.VenueId = updateDto.VenueId.Value;

            _segmentRepository.Update(existingSegment);
            await _segmentRepository.SaveChangesAsync();
            return MapToResponseDto(existingSegment);
        }

        public async Task<bool> DeleteSegmentAsync(int id)
        {
            var segment = await _segmentRepository.GetByIdAsync(id);

            if (segment == null)
            {
                return false;
            }

            _segmentRepository.Delete(segment);
            await _segmentRepository.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<SegmentResponseDto>> GetByVenueIdAsync(int venueId)
        {
            var segments = await _segmentRepository.GetByVenueIdAsync(venueId);
            return segments.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<SegmentResponseDto>> GetBySegmentTypeAsync(SegmentType segmentType)
        {
            var segments = await _segmentRepository.GetBySegmentTypeAsync(segmentType);
            return segments.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<ZoneResponseDto>> GetZonesAsync(int segmentId)
        {
            var zones = await _segmentRepository.GetZonesAsync(segmentId);

            return zones.Select(z => new ZoneResponseDto
            {
                ZoneId = z.ZoneId,
                Name = z.Name,
                Description = z.Description,
                Capacity = z.Capacity,
                BasePrice = z.BasePrice,
                Position = z.Position,
                SegmentId = z.SegmentId,
                TicketTypeIds = z.TicketTypes?.Select(tt => tt.TicketTypeId).ToList()
            });
        }

        public async Task<int> CalculateTotalCapacityAsync(int segmentId)
        {
            return await _segmentRepository.CalculateTotalCapacityAsync(segmentId);
        }

        // Helper methods for mapping

        private static SegmentResponseDto MapToResponseDto(Segment segment)
        {
            return new SegmentResponseDto
            {
                SegmentId = segment.SegmentId,
                Name = segment.Name,
                Description = segment.Description,
                Capacity = segment.Capacity,
                SegmentType = segment.SegmentType,
                VenueId = segment.VenueId,
                ZoneIds = segment.Zones?.Select(z => z.ZoneId).ToList()
            };
        }

        private static Segment MapToEntity(SegmentCreateDto dto)
        {
            return new Segment
            {
                Name = dto.Name,
                Description = dto.Description,
                Capacity = dto.Capacity,
                SegmentType = dto.SegmentType,
                VenueId = dto.VenueId
            };
        }
    }
}
