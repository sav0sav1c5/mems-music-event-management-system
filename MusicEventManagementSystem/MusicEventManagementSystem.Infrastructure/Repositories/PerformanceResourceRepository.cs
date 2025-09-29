using Microsoft.EntityFrameworkCore;
using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;
using MusicEventManagementSystem.Infrastructure.Database;

namespace MusicEventManagementSystem.Infrastructure.Repositories
{
    public class PerformanceResourceRepository : Repository<PerformanceResource>, IPerformanceResourceRepository
    {
        public PerformanceResourceRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<PerformanceResource>> GetByPerformanceIdAsync(int performanceId)
        {
            return await _dbSet.Where(pr => pr.PerformanceId == performanceId).ToListAsync();
        }

        public async Task<IEnumerable<PerformanceResource>> GetByResourceIdAsync(int resourceId)
        {
            return await _dbSet.Where(pr => pr.ResourceId == resourceId).ToListAsync();
        }
    }
}