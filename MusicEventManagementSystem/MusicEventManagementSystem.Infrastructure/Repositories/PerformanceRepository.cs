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

        //public async Task<IEnumerable<Performance>> GetByEventIdAsync(int eventId)
        //{
        //    return await _dbSet.Where(p => p.EventId == eventId).ToListAsync();
        //}

        public async Task<IEnumerable<Performance>> GetByPerformerIdAsync(int performerId)
        {
            return await _dbSet.Where(p => p.PerformerId == performerId).ToListAsync();
        }

        public async Task<IEnumerable<Performance>> GetByVenueIdAsync(int venueId)
        {
            return await _dbSet.Where(p => p.VenueId == venueId).ToListAsync();
        }

        public async Task<IEnumerable<Performance>> GetByDateRangeAsync(DateTime start, DateTime end)
        {
            return await _dbSet.Where(p => p.StartTime >= start && p.EndTime <= end).ToListAsync();
        }
    }
}