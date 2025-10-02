using Microsoft.EntityFrameworkCore;
<<<<<<< HEAD:MusicEventManagementSystem/MusicEventManagementSystem.API/Repositories/PerformanceResourceRepository.cs
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
=======
using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;
using MusicEventManagementSystem.Infrastructure.Database;
>>>>>>> fc7d1e8729b7d2d6668f9b466d7f35e20a9a6543:MusicEventManagementSystem/MusicEventManagementSystem.Infrastructure/Repositories/PerformanceResourceRepository.cs

namespace MusicEventManagementSystem.Infrastructure.Repositories
{
    public class PerformanceResourceRepository : Repository<PerformanceResource>, IPerformanceResourceRepository
    {
        private readonly ApplicationDbContext _context;

        public PerformanceResourceRepository(ApplicationDbContext context) : base(context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        private IQueryable<PerformanceResource> IncludeRelations()
        {
            return _context.PerformanceResources
                .Include(pr => pr.Performance)
                    .ThenInclude(p => p.Event)
                .Include(pr => pr.Performance)
                    .ThenInclude(p => p.Performer)
                .Include(pr => pr.Performance)
                    .ThenInclude(p => p.Venue)
                .Include(pr => pr.Resource);
        }

        public override async Task<IEnumerable<PerformanceResource>> GetAllAsync()
        {
            return await IncludeRelations()
                .Where(pr => pr.DeletedAt == null)
                .ToListAsync();
        }

        public override async Task<PerformanceResource?> GetByIdAsync(int id)
        {
            return await IncludeRelations()
                .FirstOrDefaultAsync(pr => pr.Id == id && pr.DeletedAt == null);
        }

        public async Task<IEnumerable<PerformanceResource>> GetByPerformanceIdAsync(int performanceId)
        {
            return await IncludeRelations()
                .Where(pr => pr.PerformanceId == performanceId && pr.DeletedAt == null)
                .ToListAsync();
        }

        public async Task<IEnumerable<PerformanceResource>> GetByResourceIdAsync(int resourceId)
        {
            return await IncludeRelations()
                .Where(pr => pr.ResourceId == resourceId && pr.DeletedAt == null)
                .ToListAsync();
        }
    }
}
