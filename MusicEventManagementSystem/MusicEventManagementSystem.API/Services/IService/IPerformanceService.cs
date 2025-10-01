using MusicEventManagementSystem.API.Models;

namespace MusicEventManagementSystem.API.Services.IService
{
    public interface IPerformanceService
    {
        Task<IEnumerable<Performance>> GetAllPerformancesAsync();
        Task<Performance?> GetPerformanceByIdAsync(int id);
        Task<IEnumerable<Performance>> GetPerformancesByEventIdAsync(int eventId);
        Task<Performance> CreatePerformanceAsync(Performance performance);
        Task<Performance?> UpdatePerformanceAsync(int id, Performance performance);
        Task<bool> DeletePerformanceAsync(int id);
    }
}