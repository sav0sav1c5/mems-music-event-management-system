using Microsoft.EntityFrameworkCore;
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.Data;

namespace MusicEventManagementSystem.API.Repositories
{
    public class NegotiationRepository : Repository<Negotiation>, INegotiationRepository
    {
        public NegotiationRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<Negotiation?> GetNegotiationWithDetailsAsync(int id)
        {
            return await _dbSet
                .Include(n => n.Event)
                .Include(n => n.Performer)
                .Include(n => n.Communication)
                .Include(n => n.NegotiationPhases)
                    .ThenInclude(np => np.Phase)
                        .ThenInclude(p => p.Requirements)
                .Include(n => n.RequirementFulfillments)
                .Include(n => n.Documents)
                .Include(n => n.Users)
                    .ThenInclude(nu => nu.User)
                .FirstOrDefaultAsync(n => n.NegotiationId == id);
        }

        public async Task<IEnumerable<Negotiation>> GetNegotiationsWithBasicDetailsAsync()
        {
            return await _dbSet
                .Include(n => n.Event)
                .Include(n => n.Performer)
                .Include(n => n.NegotiationPhases)
                    .ThenInclude(np => np.Phase)
                .Include(n => n.Documents)
                .ToListAsync();
        }

        public async Task<IEnumerable<Negotiation>> GetNegotiationsByEventIdAsync(int eventId)
        {
            return await _dbSet
                .Include(n => n.Performer)
                .Where(n => n.EventId == eventId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Negotiation>> GetNegotiationsByPerformerIdAsync(int performerId)
        {
            return await _dbSet
                .Include(n => n.Event)
                .Where(n => n.PerformerId == performerId)
                .ToListAsync();
        }

        public async Task<bool> AddUserToNegotiationAsync(int negotiationId, string userId)
        {
            var existingLink = await _context.NegotiationUsers
                .FirstOrDefaultAsync(nu => nu.NegotiationId == negotiationId && nu.UserId == userId);
            
            if (existingLink != null)
                return false; // Already exists
            
            var negotiationUser = new NegotiationUser
            {
                NegotiationId = negotiationId,
                UserId = userId
            };
            
            await _context.NegotiationUsers.AddAsync(negotiationUser);
            return true;
        }

        public async Task<bool> RemoveUserFromNegotiationAsync(int negotiationId, string userId)
        {
            var negotiationUser = await _context.NegotiationUsers
                .FirstOrDefaultAsync(nu => nu.NegotiationId == negotiationId && nu.UserId == userId);
            
            if (negotiationUser == null)
                return false;
            
            _context.NegotiationUsers.Remove(negotiationUser);
            return true;
        }

        public async Task<IEnumerable<string>> GetNegotiationUserEmailsAsync(int negotiationId)
        {
            return await _context.NegotiationUsers
                .Where(nu => nu.NegotiationId == negotiationId)
                .Include(nu => nu.User)
                .Select(nu => nu.User.Email ?? string.Empty)
                .ToListAsync();
        }
    }
}
