<<<<<<< HEAD:MusicEventManagementSystem/MusicEventManagementSystem.API/Services/PerformanceResourceService.cs
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.API.Services.IService;
using MusicEventManagementSystem.Enums;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
=======
using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;
>>>>>>> fc7d1e8729b7d2d6668f9b466d7f35e20a9a6543:MusicEventManagementSystem/MusicEventManagementSystem.EventOrganization.API/Services/PerformanceResourceService.cs

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

        public async Task<IEnumerable<PerformanceResource>> GetPerformanceResourcesByPerformanceIdAsync(int performanceId)
        {
            return await _performanceResourceRepository.GetByPerformanceIdAsync(performanceId);
        }

        public async Task<PerformanceResource> CreatePerformanceResourceAsync(PerformanceResource performanceResource)
        {
            performanceResource.CreatedAt = DateTime.UtcNow;
            performanceResource.UpdatedAt = DateTime.UtcNow;
            if (performanceResource.QuantityNeeded <= 0)
            {
                performanceResource.QuantityNeeded = 1;
            }
            if (performanceResource.Status == PerformanceResourceStatus.None)
            {
                performanceResource.Status = PerformanceResourceStatus.Requested;
            }
            await _performanceResourceRepository.AddAsync(performanceResource);
            await _performanceResourceRepository.SaveChangesAsync();
            var created = await _performanceResourceRepository.GetByIdAsync(performanceResource.Id);
            if (created == null)
            {
                throw new InvalidOperationException("Failed to load created performance resource");
            }
            return created;
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
            existingPerformanceResource.QuantityNeeded = performanceResource.QuantityNeeded <= 0
                ? existingPerformanceResource.QuantityNeeded
                : performanceResource.QuantityNeeded;
            if (performanceResource.Status != PerformanceResourceStatus.None)
            {
                existingPerformanceResource.Status = performanceResource.Status;
            }
            existingPerformanceResource.UpdatedAt = DateTime.UtcNow;

            _performanceResourceRepository.Update(existingPerformanceResource);
            await _performanceResourceRepository.SaveChangesAsync();
            return await _performanceResourceRepository.GetByIdAsync(existingPerformanceResource.Id);
        }

        public async Task<bool> DeletePerformanceResourceAsync(int id)
        {
            var performanceResource = await _performanceResourceRepository.GetByIdAsync(id);
            if (performanceResource == null)
            {
                return false;
            }

            performanceResource.DeletedAt = DateTime.UtcNow;
            _performanceResourceRepository.Update(performanceResource);
            await _performanceResourceRepository.SaveChangesAsync();
            return true;
        }
    }
}
