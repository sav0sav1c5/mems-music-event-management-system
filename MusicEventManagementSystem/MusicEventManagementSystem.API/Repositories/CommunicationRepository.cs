using Microsoft.EntityFrameworkCore;
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.Data;

namespace MusicEventManagementSystem.API.Repositories
{
    public class CommunicationRepository : Repository<Communication>, ICommunicationRepository
    {
        public CommunicationRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<Communication?> GetByNegotiationIdAsync(int negotiationId)
        {
            return await _dbSet
                .FirstOrDefaultAsync(c => c.NegotiationId == negotiationId);
        }
    }
}
