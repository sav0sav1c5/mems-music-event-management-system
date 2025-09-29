using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.EventOrganization.API.Controllers
{
    public class PerformanceService : IPerformanceService
    {
        private readonly IPerformanceRepository _performanceRepository;

        public PerformanceService(IPerformanceRepository performanceRepository)
        {
            _performanceRepository = performanceRepository;
        }

        public async Task<IEnumerable<Performance>> GetAllPerformancesAsync()
        {
            return await _performanceRepository.GetAllAsync();
        }

        public async Task<Performance?> GetPerformanceByIdAsync(int id)
        {
            return await _performanceRepository.GetByIdAsync(id);
        }

        public async Task<Performance> CreatePerformanceAsync(Performance performance)
        {
            performance.CreatedAt = DateTime.UtcNow;
            performance.UpdatedAt = DateTime.UtcNow;
            await _performanceRepository.AddAsync(performance);
            await _performanceRepository.SaveChangesAsync();
            return performance;
        }

        public async Task<Performance?> UpdatePerformanceAsync(int id, Performance performance)
        {
            var existingPerformance = await _performanceRepository.GetByIdAsync(id);
            if (existingPerformance == null)
            {
                return null;
            }

            existingPerformance.EventId = performance.EventId;
            existingPerformance.PerformerId = performance.PerformerId;
            existingPerformance.VenueId = performance.VenueId;
            existingPerformance.StartTime = performance.StartTime;
            existingPerformance.EndTime = performance.EndTime;
            existingPerformance.SetupTime = performance.SetupTime;
            existingPerformance.SoundcheckTime = performance.SoundcheckTime;
            existingPerformance.Status = performance.Status;
            existingPerformance.UpdatedAt = DateTime.UtcNow;

            _performanceRepository.Update(existingPerformance);
            await _performanceRepository.SaveChangesAsync();
            return existingPerformance;
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
    }
}