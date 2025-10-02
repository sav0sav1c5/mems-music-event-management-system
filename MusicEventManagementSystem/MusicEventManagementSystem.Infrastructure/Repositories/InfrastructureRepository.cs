using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Infrastructure.Database;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;
using Microsoft.EntityFrameworkCore;

namespace MusicEventManagementSystem.Infrastructure.Repositories
{
    public class InfrastructureRepository : Repository<EventInfrastructure>, IInfrastructureRepository
    {
        public InfrastructureRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<EventInfrastructure>> GetBySizeAsync(decimal size)
        {
            return await _dbSet.Where(i => i.Size == size).ToListAsync();
        }

    }
}