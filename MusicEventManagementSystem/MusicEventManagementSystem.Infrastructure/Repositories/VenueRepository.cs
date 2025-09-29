using Microsoft.EntityFrameworkCore;
using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;
using MusicEventManagementSystem.Infrastructure.Database;

namespace MusicEventManagementSystem.Infrastructure.Repositories
{
    public class VenueRepository : Repository<Venue>, IVenueRepository
    {
        public VenueRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async override Task<IEnumerable<Venue>> GetAllAsync()
        {
            return await _context.Venues.Include(v => v.Segments).ToListAsync();
        }

        public async override Task<Venue?> GetByIdAsync(int id)
        {
            return await _context.Venues.Include(v => v.Segments).FirstOrDefaultAsync(v => v.VenueId == id);
        }

        public async Task<IEnumerable<Venue>> GetByCityAsync(string city)
        {
            return await _context.Venues.Where(v => v.City.ToLower() == city.ToLower()).Include(v => v.Segments).ToListAsync();
        }

        public async Task<IEnumerable<Venue>> GetByCapacityRangeAsync(int min, int max)
        {
            return await _context.Venues.Where(v => v.Capacity >= min && v.Capacity <= max).Include(v => v.Segments).ToListAsync();
        }

        public async Task<IEnumerable<Segment>> GetSegmentsAsync(int venueId)
        {
            return await _context.Segments.Where(s => s.VenueId == venueId).ToListAsync();
        }
    }
}
