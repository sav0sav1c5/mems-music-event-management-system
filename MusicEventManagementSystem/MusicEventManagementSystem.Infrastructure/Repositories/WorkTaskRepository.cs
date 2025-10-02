using Microsoft.EntityFrameworkCore;
<<<<<<< HEAD:MusicEventManagementSystem/MusicEventManagementSystem.API/Repositories/WorkTaskRepository.cs
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.Data;
using MusicEventManagementSystem.Enums;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
=======
using MusicEventManagementSystem.Core.Enums.EventOrganization;
using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;
using MusicEventManagementSystem.Infrastructure.Database;
>>>>>>> fc7d1e8729b7d2d6668f9b466d7f35e20a9a6543:MusicEventManagementSystem/MusicEventManagementSystem.Infrastructure/Repositories/WorkTaskRepository.cs

namespace MusicEventManagementSystem.Infrastructure.Repositories
{
    public class WorkTaskRepository : Repository<WorkTask>, IWorkTaskRepository
    {
        public WorkTaskRepository(ApplicationDbContext context) : base(context)
        {
        }

        private IQueryable<WorkTask> IncludeRelations()
        {
            return _context.WorkTasks
                .Include(wt => wt.Performance)
                    .ThenInclude(p => p.Event)
                .Include(wt => wt.Performance)
                    .ThenInclude(p => p.Performer)
                .Include(wt => wt.Performance)
                    .ThenInclude(p => p.Venue);
        }

        public override async Task<IEnumerable<WorkTask>> GetAllAsync()
        {
            return await IncludeRelations()
                .Where(wt => wt.DeletedAt == null)
                .ToListAsync();
        }

        public override async Task<WorkTask?> GetByIdAsync(int id)
        {
            return await IncludeRelations()
                .FirstOrDefaultAsync(wt => wt.Id == id && wt.DeletedAt == null);
        }

        public async Task<IEnumerable<WorkTask>> GetByPerformanceIdAsync(int performanceId)
        {
            return await IncludeRelations()
                .Where(wt => wt.PerformanceId == performanceId && wt.DeletedAt == null)
                .ToListAsync();
        }

        public async Task<IEnumerable<WorkTask>> GetByStatusAsync(WorkTaskStatus status)
        {
            return await IncludeRelations()
                .Where(wt => wt.Status == status && wt.DeletedAt == null)
                .ToListAsync();
        }
    }
}
