using Microsoft.EntityFrameworkCore;
using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;
using MusicEventManagementSystem.Infrastructure.Database;

namespace MusicEventManagementSystem.Infrastructure.Repositories
{
    public class TicketTypeRepository : Repository<TicketType>, ITicketTypeRepository
    {
        public TicketTypeRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async override Task<IEnumerable<TicketType>> GetAllAsync()
        {
            return await _context.TicketTypes.Include(tt => tt.Zone).Include(tt => tt.Event).Include(tt => tt.Tickets).Include(tt => tt.SpecialOffers).Include(tt => tt.PricingRules).ToListAsync();
        }

        public async override Task<TicketType?> GetByIdAsync(int id)
        {
            return await _context.TicketTypes.Include(tt => tt.Zone).Include(tt => tt.Event).Include(tt => tt.Tickets).Include(tt => tt.SpecialOffers).Include(tt => tt.PricingRules).FirstOrDefaultAsync(tt => tt.TicketTypeId == id);
        }

        public async Task<IEnumerable<TicketType>> GetByZoneIdAsync(int zoneId)
        {
            return await _context.TicketTypes.Include(tt => tt.Zone).Include(tt => tt.Event).Include(tt => tt.Tickets).Include(tt => tt.SpecialOffers).Include(tt => tt.PricingRules).Where(tt => tt.ZoneId == zoneId).ToListAsync();
        }

        public async Task<IEnumerable<TicketType>> GetByEventIdAsync(int eventId)
        {
            return await _context.TicketTypes.Include(tt => tt.Zone).Include(tt => tt.Event).Include(tt => tt.Tickets).Include(tt => tt.SpecialOffers).Include(tt => tt.PricingRules).Where(tt => tt.EventId == eventId).ToListAsync();
        }

        public async Task<IEnumerable<TicketType>> GetByStatusAsync(TicketTypeStatus status)
        {
            return await _context.TicketTypes.Include(tt => tt.Zone).Include(tt => tt.Event).Include(tt => tt.Tickets).Include(tt => tt.SpecialOffers).Include(tt => tt.PricingRules).Where(tt => tt.Status != null && tt.Status == status).ToListAsync();
        }

        public async Task<IEnumerable<TicketType>> GetAvailableTicketTypesAsync()
        {
            return await _context.TicketTypes.Include(tt => tt.Zone).Include(tt => tt.Event).Include(tt => tt.Tickets).Include(tt => tt.SpecialOffers).Include(tt => tt.PricingRules).Where(tt => tt.AvailableQuantity > 0 &&(tt.Status == null || tt.Status == TicketTypeStatus.Active)).ToListAsync();
        }

        public async Task<bool> UpdateAvailableQuantityAsync(int id, int quantity)
        {
            var ticketType = await _context.TicketTypes.FindAsync(id);

            if (ticketType == null)
            {
                return false;
            }

            ticketType.AvailableQuantity = quantity;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<TicketType>> GetByZoneAndEventAsync(int zoneId, int eventId)
        {
            return await _context.TicketTypes.Where(tt => tt.ZoneId == zoneId && tt.EventId == eventId).ToListAsync();
        }

        public async Task<int> GetTotalAvailableQuantityByEventAsync(int eventId)
        {
            return await _context.TicketTypes.Where(tt => tt.EventId == eventId).SumAsync(tt => tt.AvailableQuantity);
        }
    }
}
