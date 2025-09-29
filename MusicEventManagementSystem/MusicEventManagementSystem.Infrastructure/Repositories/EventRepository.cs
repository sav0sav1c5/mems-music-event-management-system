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

        public async Task<Event?> GetByNameAsync(string name)
        {
            return await _dbSet.FirstOrDefaultAsync(e => e.Name == name);
        }

        public async Task<IEnumerable<Event>> GetByStatusAsync(EventStatus status)
        {
            return await _dbSet.Where(e => e.Status == status).ToListAsync();
        }

        public async Task<IEnumerable<Event>> GetByDateRangeAsync(DateTime start, DateTime end)
        {
            return await _dbSet.Where(e => e.EventInterval >= start && e.EventInterval <= end).ToListAsync();
        }

        public async Task<IEnumerable<Event>> GetByCreatedByIdAsync(Guid createdById)
        {
            return await _dbSet.Where(e => e.CreatedById == createdById).ToListAsync();
        }


    }
}