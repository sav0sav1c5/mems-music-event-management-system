using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.Core.Interfaces.Services
{
    public interface IPerformanceService
    {
        Task<IEnumerable<Performance>> GetAllPerformancesAsync();
        Task<Performance?> GetPerformanceByIdAsync(int id);
        Task<Performance> CreatePerformanceAsync(Performance performance);
        Task<Performance?> UpdatePerformanceAsync(int id, Performance performance);
        Task<bool> DeletePerformanceAsync(int id);
    }
}