using Microsoft.EntityFrameworkCore;
using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;
using MusicEventManagementSystem.Infrastructure.Database;

namespace MusicEventManagementSystem.Infrastructure.Repositories
{
    public class SegmentRepository : Repository<Segment>, ISegmentRepository
    {
        public SegmentRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async override Task<IEnumerable<Segment>> GetAllAsync()
        {
            return await _context.Segments.Include(s => s.Venue).Include(s => s.Zones).ToListAsync();
        }

        public async override Task<Segment?> GetByIdAsync(int id)
        {
            return await _context.Segments.Include(s => s.Venue).Include(s => s.Zones).FirstOrDefaultAsync(s => s.SegmentId == id);
        }

        public async Task<IEnumerable<Segment>> GetByVenueIdAsync(int venueId)
        {
            return await _context.Segments.Where(s => s.VenueId == venueId).Include(s => s.Venue).Include(s => s.Zones).ToListAsync();
        }

        public async Task<IEnumerable<Segment>> GetBySegmentTypeAsync(SegmentType segmentType)
        {
            return await _context.Segments.Include(s => s.Venue).Include(s => s.Zones).Where(s => s.SegmentType == segmentType).ToListAsync();
        }

        public async Task<IEnumerable<Zone>> GetZonesAsync(int segmentId)
        {
            return await _context.Zones.Include(z => z.Segment).Include(z => z.TicketTypes).Where(z => z.SegmentId == segmentId).ToListAsync();
        }

        public async Task<int> CalculateTotalCapacityAsync(int segmentId)
        {
            var zones = await _context.Zones.Where(z => z.SegmentId == segmentId).ToListAsync();
            return zones.Sum(z => z.Capacity);
        }

    }
}
