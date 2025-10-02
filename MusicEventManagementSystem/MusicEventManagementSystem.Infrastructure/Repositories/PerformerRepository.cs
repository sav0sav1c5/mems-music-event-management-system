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

        public override async Task<IEnumerable<Performer>> GetAllAsync()
        {
            return await _context.Performers.Include(p => p.Negotiation).Include(p => p.Contracts).Include(p => p.Performances).ToListAsync();
        }

        public override async Task<Performer?> GetByIdAsync(int id)
        {
            return await _context.Performers.Include(p => p.Negotiation).Include(p => p.Contracts).Include(p => p.Performances).FirstOrDefaultAsync(p => p.PerformerId == id);
        }

        public async Task<Performer?> GetByNameAsync(string name)
        {
            return await _context.Performers.Include(p => p.Negotiation).Include(p => p.Contracts).Include(p => p.Performances).FirstOrDefaultAsync(p => p.Name == name);
        }

        public async Task<IEnumerable<Performer>> GetByGenreAsync(string genre)
        {
            return await _context.Performers.Include(p => p.Negotiation).Include(p => p.Contracts).Include(p => p.Performances).Where(p => p.Genre.Contains(genre)).ToListAsync();
        }
    }
}