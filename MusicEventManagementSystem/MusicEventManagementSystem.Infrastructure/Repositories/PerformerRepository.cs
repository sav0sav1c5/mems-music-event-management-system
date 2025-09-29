using Microsoft.EntityFrameworkCore;
using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;
using MusicEventManagementSystem.Infrastructure.Database;

namespace MusicEventManagementSystem.Infrastructure.Repositories
{
    public class PerformerRepository : Repository<Performer>, IPerformerRepository
    {
        public PerformerRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<Performer?> GetByNameAsync(string name)
        {
            return await _dbSet.FirstOrDefaultAsync(p => p.Name == name);
        }

        public async Task<IEnumerable<Performer>> GetByGenreAsync(string genre)
        {
            return await _dbSet.Where(p => p.Genre.Contains(genre)).ToListAsync();
        }
    }
}