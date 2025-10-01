using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.API.Services.IService;

namespace MusicEventManagementSystem.API.Services
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

        public async Task<IEnumerable<Performance>> GetPerformancesByEventIdAsync(int eventId)
        {
            return await _performanceRepository.GetByEventIdAsync(eventId);
        }

        public async Task<Performance> CreatePerformanceAsync(Performance performance)
        {
            performance.CreatedAt = DateTime.UtcNow;
            performance.UpdatedAt = DateTime.UtcNow;
            await _performanceRepository.AddAsync(performance);
            await _performanceRepository.SaveChangesAsync();
            var created = await _performanceRepository.GetByIdAsync(performance.Id);
            if (created == null)
            {
                throw new InvalidOperationException("Failed to load created performance");
            }
            return created;
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
            return await _performanceRepository.GetByIdAsync(existingPerformance.Id);
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
