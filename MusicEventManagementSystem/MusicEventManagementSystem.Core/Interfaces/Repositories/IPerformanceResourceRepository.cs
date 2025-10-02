using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.Core.Interfaces.Repositories
{
    public interface IPerformanceResourceRepository : IRepository<PerformanceResource>
    {
        Task<IEnumerable<PerformanceResource>> GetByPerformanceIdAsync(int performanceId);
        Task<IEnumerable<PerformanceResource>> GetByResourceIdAsync(int resourceId);
    }
}