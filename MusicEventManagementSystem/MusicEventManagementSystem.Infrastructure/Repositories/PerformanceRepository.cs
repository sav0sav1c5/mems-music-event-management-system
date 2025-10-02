using Microsoft.EntityFrameworkCore;
using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;
using MusicEventManagementSystem.Infrastructure.Database;

namespace MusicEventManagementSystem.Infrastructure.Repositories
{
    public class PerformanceRepository : Repository<Performance>, IPerformanceRepository
    {
        public PerformanceRepository(ApplicationDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<Performance>> GetAllAsync()
        {
            return await _context.Performances.Include(p => p.Performer).Include(p => p.Venue).ToListAsync();
        }

        public override async Task<Performance?> GetByIdAsync(int id)
        {
            return await _context.Performances.Include(p => p.Performer).Include(p => p.Venue).FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<IEnumerable<Performance>> GetByPerformerIdAsync(int performerId)
        {
            return await _context.Performances.Include(p => p.Performer).Include(p => p.Venue).Where(p => p.PerformerId == performerId).ToListAsync();
        }

        public async Task<IEnumerable<Performance>> GetByVenueIdAsync(int venueId)
        {
            return await _context.Performances.Include(p => p.Performer).Include(p => p.Venue).Where(p => p.VenueId == venueId).ToListAsync();
        }

        public async Task<IEnumerable<Performance>> GetByDateRangeAsync(DateTime start, DateTime end)
        {
            return await _context.Performances.Include(p => p.Performer).Include(p => p.Venue).Where(p => p.StartTime >= start && p.EndTime <= end).ToListAsync();
        }
    }
}