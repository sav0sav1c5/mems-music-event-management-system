using Microsoft.EntityFrameworkCore;
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.Data;

namespace MusicEventManagementSystem.API.Repositories
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
                .Include(p => p.NegotiationPhases)
                .FirstOrDefaultAsync(p => p.PhaseId == id);
        }

        // Phases are now global - use NegotiationPhaseRepository for negotiation-specific data
        public async Task<IEnumerable<Phase>> GetPhasesByNegotiationIdAsync(int negotiationId)
        {
            // Return all global phases - negotiation status should be queried separately
            return await _dbSet
                .Include(p => p.Requirements)
                .OrderBy(p => p.OrderNumber)
                .ToListAsync();
        }

        // Phases are no longer directly linked to contracts
        public Task<IEnumerable<Phase>> GetPhasesByContractIdAsync(int contractId)
        {
            // Return empty collection since this relationship no longer exists
            return Task.FromResult<IEnumerable<Phase>>(new List<Phase>());
        }

        public async Task<IEnumerable<Phase>> GetPhasesWithRequirementsAsync()
        {
            return await _dbSet
                .Include(p => p.Requirements)
                .Include(p => p.NegotiationPhases)
                .OrderBy(p => p.OrderNumber)
                .ToListAsync();
        }
    }
}
