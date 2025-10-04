using MusicEventManagementSystem.API.Services.IServices;
using MusicEventManagementSystem.API.Services.Proxies.IProxies;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.DTOs.Client;

namespace MusicEventManagementSystem.API.Services
{
    public class ClientPerformerService : IClientPerformerService
    {
        private readonly IPerformerProxyService _performerService;
        private readonly IPerformanceProxyService _performanceService;

        public ClientPerformerService(IPerformerProxyService performerService, IPerformanceProxyService performanceService)
        {
            _performerService = performerService;
            _performanceService = performanceService;
        }

        public async Task<IEnumerable<PerformerInfoDto>> GetFeaturedPerformersAsync()
        {
            var allPerformers = await _performerService.GetAllPerformersAsync();

            // Featured: Top 10 by popularity
            var featuredPerformers = allPerformers.OrderByDescending(p => p.Popularity).Take(10);

            return featuredPerformers.Select(p => new PerformerInfoDto
            {
                PerformerId = p.PerformerId,
                Name = p.Name,
                Genre = p.Genre,
                PerformanceStartTime = null,
                PerformanceEndTime = null
            });
        }

        public async Task<PerformerInfoDto?> GetPerformerDetailsAsync(int performerId)
        {
            var performer = await _performerService.GetPerformerByIdAsync(performerId);

            if (performer == null)
            {
                return null;
            }

            // Get next upcoming performance
            var performances = await _performanceService.GetByPerformerIdAsync(performerId);
            var upcomingPerformance = performances.Where(p => p.StartTime > DateTime.UtcNow).OrderBy(p => p.StartTime).FirstOrDefault();

            return new PerformerInfoDto
            {
                PerformerId = performer.PerformerId,
                Name = performer.Name,
                Genre = performer.Genre,
                PerformanceStartTime = upcomingPerformance?.StartTime,
                PerformanceEndTime = upcomingPerformance?.EndTime
            };
        }

        public async Task<IEnumerable<PerformerInfoDto>> SearchPerformersAsync(string? keyword, string? genre)
        {
            var allPerformers = await _performerService.GetAllPerformersAsync();

            // Filter by keyword
            if (!string.IsNullOrWhiteSpace(keyword))
            {
                keyword = keyword.ToLower();
                allPerformers = allPerformers.Where(p =>
                    (p.Name?.ToLower().Contains(keyword) ?? false) ||
                    (p.Genre?.ToLower().Contains(keyword) ?? false)
                );
            }

            // Filter by genre
            if (!string.IsNullOrWhiteSpace(genre))
            {
                allPerformers = allPerformers.Where(p =>
                    p.Genre?.Equals(genre, StringComparison.OrdinalIgnoreCase) ?? false
                );
            }

            return allPerformers.Select(p => new PerformerInfoDto
            {
                PerformerId = p.PerformerId,
                Name = p.Name,
                Genre = p.Genre,
                PerformanceStartTime = null,
                PerformanceEndTime = null
            });
        }
    }
}
