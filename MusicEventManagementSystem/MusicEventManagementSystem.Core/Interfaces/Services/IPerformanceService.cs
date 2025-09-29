using MusicEventManagementSystem.Core.Models.DTOs.EventOrganization;

namespace MusicEventManagementSystem.Core.Interfaces.Services
{
    public interface IPerformanceService
    {
        Task<IEnumerable<PerformanceResponseDto>> GetAllPerformancesAsync();
        Task<PerformanceResponseDto?> GetPerformanceByIdAsync(int id);
        Task<PerformanceResponseDto> CreatePerformanceAsync(PerformanceCreateDto performanceDto);
        Task<PerformanceResponseDto?> UpdatePerformanceAsync(int id, PerformanceUpdateDto performanceDto);
        Task<bool> DeletePerformanceAsync(int id);

        Task<IEnumerable<PerformanceResponseDto>> GetByPerformerIdAsync(int performerId);
        Task<IEnumerable<PerformanceResponseDto>> GetByVenueIdAsync(int venueId);
        Task<IEnumerable<PerformanceResponseDto>> GetByDateRangeAsync(DateTime start, DateTime end);
    }
}