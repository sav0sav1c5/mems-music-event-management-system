using Microsoft.EntityFrameworkCore;
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.Data;

namespace MusicEventManagementSystem.API.Repositories
{
    public class PerformanceRepository : Repository<Performance>, IPerformanceRepository
    {
        private readonly ApplicationDbContext _context;

        public PerformanceRepository(ApplicationDbContext context) : base(context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public override async Task<IEnumerable<Performance>> GetAllAsync()
        {
            return await IncludeRelations()
                .Where(p => p.DeletedAt == null)
                .ToListAsync();
        }

        public override async Task<Performance?> GetByIdAsync(int id)
        {
            return await IncludeRelations()
                .FirstOrDefaultAsync(p => p.Id == id && p.DeletedAt == null);
        }

        private IQueryable<Performance> IncludeRelations()
        {
            return _context.Performances
                .Include(p => p.Event)
                    .ThenInclude(e => e.Location)
                .Include(p => p.Performer)
                .Include(p => p.Venue);
        }

        public async Task<IEnumerable<Performance>> GetByEventIdAsync(int eventId)
        {
            return await IncludeRelations()
                .Where(p => p.EventId == eventId && p.DeletedAt == null)
                .ToListAsync();
        }

        public async Task<IEnumerable<Performance>> GetByPerformerIdAsync(int performerId)
        {
            return await IncludeRelations()
                .Where(p => p.PerformerId == performerId && p.DeletedAt == null)
                .ToListAsync();
        }

        public async Task<IEnumerable<Performance>> GetByVenueIdAsync(int venueId)
        {
            return await IncludeRelations()
                .Where(p => p.VenueId == venueId && p.DeletedAt == null)
                .ToListAsync();
        }

        public async Task<IEnumerable<Performance>> GetByDateRangeAsync(DateTime start, DateTime end)
        {
            return await IncludeRelations()
                .Where(p => p.StartTime >= start && p.EndTime <= end && p.DeletedAt == null)
                .ToListAsync();
        }
    }
}
