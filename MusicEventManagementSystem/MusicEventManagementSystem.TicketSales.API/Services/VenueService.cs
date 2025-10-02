using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.DTOs.EventOrganization;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;

namespace MusicEventManagementSystem.TicketSales.API.Services
{
    public class VenueService : IVenueService
    {
        private readonly IVenueRepository _venueRepository;

        public VenueService(IVenueRepository venueRepository)
        {
            _venueRepository = venueRepository;
        }

        public async Task<IEnumerable<VenueResponseDto>> GetAllVenuesAsync()
        {
            var venues = await _venueRepository.GetAllAsync();
            return venues.Select(MapToResponseDto);
        }

        public async Task<VenueResponseDto?> GetVenueByIdAsync(int id)
        {
            var existingVenue = await _venueRepository.GetByIdAsync(id);

            if (existingVenue == null)
            {
                return null;
            }

            return MapToResponseDto(existingVenue);
        }

        public async Task<VenueResponseDto> CreateVenueAsync(VenueCreateDto createVenueDto)
        {
            var venue = MapToEntity(createVenueDto);

            await _venueRepository.AddAsync(venue);
            await _venueRepository.SaveChangesAsync();
            return MapToResponseDto(venue);
        }

        public async Task<VenueResponseDto?> UpdateVenueAsync(int id, VenueUpdateDto updateVenueDto)
        {
            var existingVenue = await _venueRepository.GetByIdAsync(id);
            if (existingVenue == null)
            {
                return null;
            }

            if (!string.IsNullOrEmpty(updateVenueDto.Name))
                existingVenue.Name = updateVenueDto.Name;

            if (updateVenueDto.Description != null)
                existingVenue.Description = updateVenueDto.Description;

            if (!string.IsNullOrEmpty(updateVenueDto.City))
                existingVenue.City = updateVenueDto.City;

            if (!string.IsNullOrEmpty(updateVenueDto.Address))
                existingVenue.Address = updateVenueDto.Address;

            if (updateVenueDto.Capacity.HasValue)
                existingVenue.Capacity = updateVenueDto.Capacity.Value;

            if (updateVenueDto.VenueType.HasValue)
                existingVenue.VenueType = updateVenueDto.VenueType.Value;

            if (updateVenueDto.EventId.HasValue)
                existingVenue.EventId = updateVenueDto.EventId.Value;

            _venueRepository.Update(existingVenue);
            await _venueRepository.SaveChangesAsync();
            return MapToResponseDto(existingVenue);
        }

        public async Task<bool> DeleteVenueAsync(int venueId)
        {
            var venue = await _venueRepository.GetByIdAsync(venueId);

            if (venue == null)
            {
                return false;
            }

            _venueRepository.Delete(venue);
            await _venueRepository.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<VenueResponseDto>> GetByCityAsync(string city)
        {
            var venues = await _venueRepository.GetByCityAsync(city);
            return venues.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<VenueResponseDto>> GetByCapacityRangeAsync(int min, int max)
        {
            var venues = await _venueRepository.GetByCapacityRangeAsync(min, max);
            return venues.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<VenueResponseDto>> GetByEventIdAsync(int eventId)
        {
            var venues = await _venueRepository.GetByEventIdAsync(eventId);
            return venues.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<SegmentResponseDto>> GetSegmentsAsync(int venueId)
        {
            var segments = await _venueRepository.GetSegmentsAsync(venueId);
            return segments.Select(s => new SegmentResponseDto
            {
                SegmentId = s.SegmentId,
                Name = s.Name,
                Description = s.Description,
                Capacity = s.Capacity,
                SegmentType = s.SegmentType,
                VenueId = s.VenueId,
                ZoneIds = s.Zones?.Select(z => z.ZoneId).ToList()
            });
        }

        public async Task<IEnumerable<PerformanceResponseDto>> GetPerformancesAsync(int venueId)
        {
            var performances = await _venueRepository.GetPerformancesAsync(venueId);
            return performances.Select(p => new PerformanceResponseDto
            {
                Id = p.Id,
                PerformerId = p.PerformerId,
                VenueId = p.VenueId,
                StartTime = p.StartTime,
                EndTime = p.EndTime,
                SetupTime = p.SetupTime,
                SoundcheckTime = p.SoundcheckTime,
                Status = p.Status,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                DeletedAt = p.DeletedAt
            });
        }

        public async Task<int> CalculateTotalCapacityAsync(int venueId)
        {
            var segments = await _venueRepository.GetSegmentsAsync(venueId);
            return segments.Sum(s => s.Capacity);
        }

        // Helper methods for mapping
        private static VenueResponseDto MapToResponseDto(Venue venue)
        {
            return new VenueResponseDto
            {
                VenueId = venue.VenueId,
                Name = venue.Name,
                Description = venue.Description,
                City = venue.City,
                Address = venue.Address,
                Capacity = venue.Capacity,
                VenueType = venue.VenueType,
                EventId = venue.EventId,
                SegmentIds = venue.Segments?.Select(s => s.SegmentId).ToList(),
                PerformanceIds = venue.Performances?.Select(p => p.Id).ToList()
            };
        }

        private static Venue MapToEntity(VenueCreateDto dto)
        {
            return new Venue
            {
                Name = dto.Name,
                Description = dto.Description,
                City = dto.City,
                Address = dto.Address,
                Capacity = dto.Capacity,
                VenueType = dto.VenueType,
                EventId = dto.EventId
            };
        }
    }
}
