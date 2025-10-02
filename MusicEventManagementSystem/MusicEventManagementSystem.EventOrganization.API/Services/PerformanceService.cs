using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;
using MusicEventManagementSystem.Core.Models.DTOs.EventOrganization;

namespace MusicEventManagementSystem.EventOrganization.API.Services
{
    public class PerformanceService : IPerformanceService
    {
        private readonly IPerformanceRepository _performanceRepository;

        public PerformanceService(IPerformanceRepository performanceRepository)
        {
            _performanceRepository = performanceRepository;
        }

        public async Task<IEnumerable<PerformanceResponseDto>> GetAllPerformancesAsync()
        {
            var performances = await _performanceRepository.GetAllAsync();
            return performances.Select(MapToResponseDto);
        }

        public async Task<PerformanceResponseDto?> GetPerformanceByIdAsync(int id)
        {
            var performance = await _performanceRepository.GetByIdAsync(id);
            return performance == null ? null : MapToResponseDto(performance);
        }

        public async Task<PerformanceResponseDto> CreatePerformanceAsync(PerformanceCreateDto performanceDto)
        {
            var performance = MapToEntity(performanceDto);
            performance.CreatedAt = DateTime.UtcNow;
            performance.UpdatedAt = DateTime.UtcNow;

            await _performanceRepository.AddAsync(performance);
            await _performanceRepository.SaveChangesAsync();

            return MapToResponseDto(performance);
        }

        public async Task<PerformanceResponseDto?> UpdatePerformanceAsync(int id, PerformanceUpdateDto performanceDto)
        {
            var existingPerformance = await _performanceRepository.GetByIdAsync(id);
            if (existingPerformance == null)
            {
                return null;
            }

            if (performanceDto.PerformerId.HasValue)
                existingPerformance.PerformerId = performanceDto.PerformerId.Value;

            if (performanceDto.VenueId.HasValue)
                existingPerformance.VenueId = performanceDto.VenueId.Value;

            if (performanceDto.StartTime.HasValue)
                existingPerformance.StartTime = performanceDto.StartTime.Value;

            if (performanceDto.EndTime.HasValue)
                existingPerformance.EndTime = performanceDto.EndTime.Value;

            if (performanceDto.SetupTime.HasValue)
                existingPerformance.SetupTime = performanceDto.SetupTime.Value;

            if (performanceDto.SoundcheckTime.HasValue)
                existingPerformance.SoundcheckTime = performanceDto.SoundcheckTime.Value;

            if (performanceDto.Status.HasValue)
                existingPerformance.Status = performanceDto.Status.Value;

            existingPerformance.UpdatedAt = DateTime.UtcNow;

            _performanceRepository.Update(existingPerformance);
            await _performanceRepository.SaveChangesAsync();

            return MapToResponseDto(existingPerformance);
        }

        public async Task<bool> DeletePerformanceAsync(int id)
        {
            var performance = await _performanceRepository.GetByIdAsync(id);
            if (performance == null)
            {
                return false;
            }

            _performanceRepository.Delete(performance);
            await _performanceRepository.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<PerformanceResponseDto>> GetByPerformerIdAsync(int performerId)
        {
            var performances = await _performanceRepository.GetByPerformerIdAsync(performerId);
            return performances.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<PerformanceResponseDto>> GetByVenueIdAsync(int venueId)
        {
            var performances = await _performanceRepository.GetByVenueIdAsync(venueId);
            return performances.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<PerformanceResponseDto>> GetByDateRangeAsync(DateTime start, DateTime end)
        {
            var performances = await _performanceRepository.GetByDateRangeAsync(start, end);
            return performances.Select(MapToResponseDto);
        }

        // Helper methods for mapping
        private static PerformanceResponseDto MapToResponseDto(Performance performance)
        {
            return new PerformanceResponseDto
            {
                Id = performance.Id,
                PerformerId = performance.PerformerId,
                VenueId = performance.VenueId,
                StartTime = performance.StartTime,
                EndTime = performance.EndTime,
                SetupTime = performance.SetupTime,
                SoundcheckTime = performance.SoundcheckTime,
                Status = performance.Status,
                CreatedAt = performance.CreatedAt,
                UpdatedAt = performance.UpdatedAt,
                DeletedAt = performance.DeletedAt
            };
        }

        private static Performance MapToEntity(PerformanceCreateDto dto)
        {
            return new Performance
            {
                PerformerId = dto.PerformerId,
                VenueId = dto.VenueId,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                SetupTime = dto.SetupTime,
                SoundcheckTime = dto.SoundcheckTime,
                Status = dto.Status
            };
        }
    }
}