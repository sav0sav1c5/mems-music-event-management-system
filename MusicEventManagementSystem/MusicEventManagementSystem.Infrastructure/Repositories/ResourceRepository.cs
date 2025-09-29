using Microsoft.EntityFrameworkCore;
using MusicEventManagementSystem.Core.Enums.EventOrganization;
using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;
using MusicEventManagementSystem.Infrastructure.Database;

namespace MusicEventManagementSystem.Infrastructure.Repositories
{
    public class ResourceRepository : Repository<Resource>, IResourceRepository
    {
        public ResourceRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<Resource?> GetByNameAsync(string name)
        {
            return await _dbSet.FirstOrDefaultAsync(r => r.Name == name);
        }

        public async Task<IEnumerable<Resource>> GetByTypeAsync(ResourceType type)
        {
            return await _dbSet.Where(r => r.Type == type).ToListAsync();
        }

        public async Task<IEnumerable<Resource>> GetAvailableResourcesAsync()
        {
            return await _dbSet.Where(r => r.IsAvailable).ToListAsync();
        }

    }
}