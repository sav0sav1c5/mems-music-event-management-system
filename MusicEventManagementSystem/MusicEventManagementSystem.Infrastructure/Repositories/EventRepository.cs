using Microsoft.EntityFrameworkCore;
using MusicEventManagementSystem.Core.Enums.EventOrganization;
using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;
using MusicEventManagementSystem.Infrastructure.Database;

namespace MusicEventManagementSystem.Infrastructure.Repositories
{
    public class EventRepository : Repository<Event>, IEventRepository
    {
        public EventRepository(ApplicationDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<Event>> GetAllAsync()
        {
            return await _context.Events.Include(e => e.Location).Include(e => e.Venues).Include(e => e.TicketTypes).Include(e => e.PricingRules).ToListAsync();
        }

        public override async Task<Event?> GetByIdAsync(int id)
        {
            return await _context.Events.Include(e => e.Location).Include(e => e.Venues).Include(e => e.TicketTypes).Include(e => e.PricingRules).FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<Event?> GetByNameAsync(string name)
        {
            return await _dbSet.FirstOrDefaultAsync(e => e.Name == name);
        }

        public async Task<IEnumerable<Event>> GetByStatusAsync(EventStatus status)
        {
            return await _dbSet.Include(e => e.Location).Include(e => e.Venues).Where(e => e.Status == status).ToListAsync();
        }

        public async Task<IEnumerable<Event>> GetByDateRangeAsync(DateTime start, DateTime end)
        {
            return await _context.Events.Include(e => e.Location).Include(e => e.Venues).Where(e => e.StartDate >= start && e.EndDate <= end).ToListAsync();
        }

        public async Task<IEnumerable<Event>> GetByCreatedByIdAsync(Guid createdById)
        {
            return await _dbSet.Include(e => e.Location).Include(e => e.Venues).Where(e => e.CreatedById == createdById).ToListAsync();
        }


    }
}