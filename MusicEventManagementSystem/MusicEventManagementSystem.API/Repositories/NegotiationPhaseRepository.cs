using Microsoft.EntityFrameworkCore;
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.Data;

namespace MusicEventManagementSystem.API.Repositories
{
    public class NegotiationPhaseRepository : Repository<NegotiationPhase>, INegotiationPhaseRepository
    {
        public NegotiationPhaseRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<NegotiationPhase>> GetNegotiationPhasesAsync(int negotiationId)
        {
            return await _dbSet
                .Where(np => np.NegotiationId == negotiationId)
                .Include(np => np.Phase)
                .ThenInclude(p => p.Requirements)
                .Include(np => np.RequirementFulfillments)
                .OrderBy(np => np.Phase.OrderNumber)
                .ToListAsync();
        }

        public async Task<NegotiationPhase?> GetCurrentNegotiationPhaseAsync(int negotiationId)
        {
            return await _dbSet
                .Where(np => np.NegotiationId == negotiationId && np.IsActive)
                .Include(np => np.Phase)
                .ThenInclude(p => p.Requirements)
                .Include(np => np.RequirementFulfillments)
                .FirstOrDefaultAsync();
        }

        public async Task<NegotiationPhase?> GetNegotiationPhaseAsync(int negotiationId, int phaseId)
        {
            return await _dbSet
                .Where(np => np.NegotiationId == negotiationId && np.PhaseId == phaseId)
                .Include(np => np.Phase)
                .ThenInclude(p => p.Requirements)
                .Include(np => np.RequirementFulfillments)
                .FirstOrDefaultAsync();
        }

        public async Task<bool> SetPhaseActiveAsync(int negotiationId, int phaseId, bool isActive)
        {
            var negotiationPhase = await _dbSet
                .FirstOrDefaultAsync(np => np.NegotiationId == negotiationId && np.PhaseId == phaseId);

            if (negotiationPhase == null) return false;

            // If setting active, deactivate all other phases first
            if (isActive)
            {
                var otherPhases = await _dbSet
                    .Where(np => np.NegotiationId == negotiationId && np.PhaseId != phaseId)
                    .ToListAsync();

                foreach (var otherPhase in otherPhases)
                {
                    otherPhase.IsActive = false;
                }
            }

            negotiationPhase.IsActive = isActive;
            if (isActive && negotiationPhase.StartDate == null)
            {
                negotiationPhase.StartDate = DateTime.UtcNow;
                negotiationPhase.Status = "InProgress";
            }

            return true;
        }

        public async Task<bool> UpdatePhaseStatusAsync(int negotiationId, int phaseId, string status)
        {
            var negotiationPhase = await _dbSet
                .FirstOrDefaultAsync(np => np.NegotiationId == negotiationId && np.PhaseId == phaseId);

            if (negotiationPhase == null) return false;

            negotiationPhase.Status = status;
            return true;
        }

        public async Task<bool> CompletePhaseAsync(int negotiationId, int phaseId)
        {
            var negotiationPhase = await _dbSet
                .FirstOrDefaultAsync(np => np.NegotiationId == negotiationId && np.PhaseId == phaseId);

            if (negotiationPhase == null) return false;

            negotiationPhase.Status = "Completed";
            negotiationPhase.CompletedDate = DateTime.UtcNow;
            negotiationPhase.IsActive = false;

            return true;
        }
    }
}