using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.EventOrganization.API.Controllers
{
    public class PerformanceResourceService : IPerformanceResourceService
    {
        private readonly IPerformanceResourceRepository _performanceResourceRepository;

        public PerformanceResourceService(IPerformanceResourceRepository performanceResourceRepository)
        {
            _performanceResourceRepository = performanceResourceRepository;
        }

        public async Task<IEnumerable<PerformanceResource>> GetAllPerformanceResourcesAsync()
        {
            return await _performanceResourceRepository.GetAllAsync();
        }

        public async Task<PerformanceResource?> GetPerformanceResourceByIdAsync(int id)
        {
            return await _performanceResourceRepository.GetByIdAsync(id);
        }

        public async Task<PerformanceResource> CreatePerformanceResourceAsync(PerformanceResource performanceResource)
        {
            performanceResource.CreatedAt = DateTime.UtcNow;
            performanceResource.UpdatedAt = DateTime.UtcNow;
            await _performanceResourceRepository.AddAsync(performanceResource);
            await _performanceResourceRepository.SaveChangesAsync();
            return performanceResource;
        }

        public async Task<PerformanceResource?> UpdatePerformanceResourceAsync(int id, PerformanceResource performanceResource)
        {
            var existingPerformanceResource = await _performanceResourceRepository.GetByIdAsync(id);
            if (existingPerformanceResource == null)
            {
                return null;
            }

            existingPerformanceResource.PerformanceId = performanceResource.PerformanceId;
            existingPerformanceResource.ResourceId = performanceResource.ResourceId;
            existingPerformanceResource.QuantityNeeded = performanceResource.QuantityNeeded;
            existingPerformanceResource.Status = performanceResource.Status;
            existingPerformanceResource.UpdatedAt = DateTime.UtcNow;

            _performanceResourceRepository.Update(existingPerformanceResource);
            await _performanceResourceRepository.SaveChangesAsync();
            return existingPerformanceResource;
        }

        public async Task<bool> DeletePerformanceResourceAsync(int id)
        {
            var performanceResource = await _performanceResourceRepository.GetByIdAsync(id);
            if (performanceResource == null)
            {
                return false;
            }

            _performanceResourceRepository.Delete(performanceResource);
            await _performanceResourceRepository.SaveChangesAsync();
            return true;
        }
    }
}