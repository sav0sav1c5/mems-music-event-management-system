using Microsoft.EntityFrameworkCore;
using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;
using MusicEventManagementSystem.Infrastructure.Database;

namespace MusicEventManagementSystem.Infrastructure.Repositories
{
    public class ZoneRepository : Repository<Zone>, IZoneRepository
    {
        public ZoneRepository(ApplicationDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<Zone>> GetAllAsync()
        {
            return await _context.Zones.Include(z => z.Segment).Include(z => z.TicketTypes).ToListAsync();
        }

        public override async Task<Zone?> GetByIdAsync(int id)
        {
            return await _context.Zones.Include(z => z.Segment).Include(z => z.TicketTypes).FirstOrDefaultAsync(z => z.ZoneId == id);
        }

        public async Task<IEnumerable<Zone>> GetBySegmentIdAsync(int segmentId)
        {
            return await _context.Zones.Include(z => z.Segment).Include(z => z.TicketTypes).Where(z => z.SegmentId == segmentId).ToListAsync();
        }

        public async Task<IEnumerable<Zone>> GetByPriceRangeAsync(decimal min, decimal max)
        {
            return await _context.Zones.Include(z => z.Segment).Include(z => z.TicketTypes).Where(z => z.BasePrice >= min && z.BasePrice <= max).ToListAsync();
        }

        public async Task<IEnumerable<Zone>> GetByPositionAsync(ZonePosition position)
        {
            return await _context.Zones.Include(z => z.Segment).Include(z => z.TicketTypes).Where(z => z.Position == position).ToListAsync();
        }

        public async Task<IEnumerable<TicketType>> GetTicketTypesAsync(int zoneId)
        {
            return await _context.TicketTypes.Include(tt => tt.Zone).Include(tt => tt.Event).Include(tt => tt.Tickets).Include(tt => tt.SpecialOffers).Include(tt => tt.PricingRules).Where(tt => tt.ZoneId == zoneId).ToListAsync();
        }
    }
}
