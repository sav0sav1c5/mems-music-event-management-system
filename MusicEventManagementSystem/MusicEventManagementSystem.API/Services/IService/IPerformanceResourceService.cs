using MusicEventManagementSystem.API.Models;
using System.Collections.Generic;

namespace MusicEventManagementSystem.API.Services.IService
{
    public interface IPerformanceResourceService
    {
        Task<IEnumerable<PerformanceResource>> GetAllPerformanceResourcesAsync();
        Task<PerformanceResource?> GetPerformanceResourceByIdAsync(int id);
        Task<IEnumerable<PerformanceResource>> GetPerformanceResourcesByPerformanceIdAsync(int performanceId);
        Task<PerformanceResource> CreatePerformanceResourceAsync(PerformanceResource performanceResource);
        Task<PerformanceResource?> UpdatePerformanceResourceAsync(int id, PerformanceResource performanceResource);
        Task<bool> DeletePerformanceResourceAsync(int id);
    }
}
