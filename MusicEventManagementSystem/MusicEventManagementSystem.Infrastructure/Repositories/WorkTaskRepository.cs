using Microsoft.EntityFrameworkCore;
using MusicEventManagementSystem.Core.Enums.EventOrganization;
using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;
using MusicEventManagementSystem.Infrastructure.Database;

namespace MusicEventManagementSystem.Infrastructure.Repositories
{
    public class WorkTaskRepository : Repository<WorkTask>, IWorkTaskRepository
    {
        public WorkTaskRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<WorkTask>> GetByPerformanceIdAsync(int performanceId)
        {
            return await _dbSet.Where(wt => wt.PerformanceId == performanceId).ToListAsync();
        }

        public async Task<IEnumerable<WorkTask>> GetByStatusAsync(WorkTaskStatus status)
        {
            return await _dbSet.Where(wt => wt.Status == status).ToListAsync();
        }
    }
}