using Microsoft.EntityFrameworkCore;
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.Data;
using MusicEventManagementSystem.Enums;

namespace MusicEventManagementSystem.API.Repositories
{
    public class EventRepository : Repository<Event>, IEventRepository
    {
        private readonly ApplicationDbContext _context;

        public EventRepository(ApplicationDbContext context) : base(context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public override async Task<Event?> GetByIdAsync(int id)
        {
            return await _context.Events
                .Include(e => e.Location)
                .FirstOrDefaultAsync(e => e.Id == id && e.DeletedAt == null);
        }

        public override async Task<IEnumerable<Event>> GetAllAsync()
        {
            return await _context.Events
                .Include(e => e.Location)
                .Where(e => e.DeletedAt == null)
                .ToListAsync();
        }

        public async Task<Event?> GetByNameAsync(string name)
        {
            return await _context.Events
                .Include(e => e.Location)
                .FirstOrDefaultAsync(e => e.Name == name && e.DeletedAt == null);
        }

        public async Task<IEnumerable<Event>> GetByStatusAsync(EventStatus status)
        {
            return await _context.Events
                .Include(e => e.Location)
                .Where(e => e.Status == status && e.DeletedAt == null)
                .ToListAsync();
        }

        public async Task<IEnumerable<Event>> GetByDateRangeAsync(DateTime start, DateTime end)
        {
            return await _context.Events
                .Include(e => e.Location)
                .Where(e => e.Interval >= start && e.Interval <= end && e.DeletedAt == null)
                .ToListAsync();
        }

        public async Task<IEnumerable<Event>> GetByCreatedByIdAsync(string createdById)
        {
            return await _context.Events
                .Include(e => e.Location)
                .Where(e => e.CreatedById == createdById && e.DeletedAt == null)
                .ToListAsync();
        }
    }
}


