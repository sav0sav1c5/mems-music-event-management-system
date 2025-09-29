using Microsoft.EntityFrameworkCore;
using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication;
using MusicEventManagementSystem.Infrastructure.Database;

namespace MusicEventManagementSystem.Infrastructure.Repositories
{
    public class PhaseRepository : Repository<Phase>, IPhaseRepository
    {
        public PhaseRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<Phase?> GetPhaseWithRequirementsAsync(int id)
        {
            return await _dbSet
                .Include(p => p.Requirements)
                .Include(p => p.Contract)
                .Include(p => p.Negotiation)
                .FirstOrDefaultAsync(p => p.PhaseId == id);
        }

        public async Task<IEnumerable<Phase>> GetPhasesByNegotiationIdAsync(int negotiationId)
        {
            return await _dbSet
                .Include(p => p.Requirements)
                .Where(p => p.NegotiationId == negotiationId)
                .OrderBy(p => p.OrderNumber)
                .ToListAsync();
        }

        public async Task<IEnumerable<Phase>> GetPhasesByContractIdAsync(int contractId)
        {
            return await _dbSet
                .Include(p => p.Requirements)
                .Where(p => p.ContractId == contractId)
                .OrderBy(p => p.OrderNumber)
                .ToListAsync();
        }

        public async Task<IEnumerable<Phase>> GetPhasesWithRequirementsAsync()
        {
            return await _dbSet
                .Include(p => p.Requirements)
                .Include(p => p.Negotiation)
                .Include(p => p.Contract)
                .ToListAsync();
        }
    }
}
