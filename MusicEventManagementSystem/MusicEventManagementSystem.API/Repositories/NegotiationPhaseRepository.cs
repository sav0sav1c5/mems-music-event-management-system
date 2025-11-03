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

        // Analytics methods
        public async Task<IEnumerable<NegotiationPhase>> GetCurrentPhasesForNegotiationsAsync(List<int> negotiationIds)
        {
            return await _dbSet
                .Where(np => negotiationIds.Contains(np.NegotiationId) && np.IsActive)
                .Include(np => np.Phase)
                .ToListAsync();
        }

        public async Task<IEnumerable<NegotiationPhase>> GetPhasesByNegotiationIdsAsync(List<int> negotiationIds)
        {
            return await _dbSet
                .Where(np => negotiationIds.Contains(np.NegotiationId))
                .Include(np => np.Phase)
                .Include(np => np.RequirementFulfillments)
                .ToListAsync();
        }

        public async Task<IEnumerable<NegotiationRequirementFulfillment>> GetRequirementFulfillmentsByNegotiationIdsAsync(List<int> negotiationIds)
        {
            return await _context.NegotiationRequirementFulfillments
                .Where(nrf => negotiationIds.Contains(nrf.NegotiationId))
                .ToListAsync();
        }

        public async Task<IEnumerable<PhaseTransitionDto>> GetPhaseHistoryAsync(List<int> negotiationIds, DateTime startDate, DateTime endDate)
        {
            // This is a simplified implementation - in a real scenario, you would track phase transitions
            // For now, we'll return mock data based on phase completion dates
            var phases = await _dbSet
                .Where(np => negotiationIds.Contains(np.NegotiationId) && 
                           np.CompletedDate.HasValue &&
                           np.CompletedDate >= startDate && 
                           np.CompletedDate <= endDate)
                .Include(np => np.Phase)
                .OrderBy(np => np.CompletedDate)
                .ToListAsync();

            var transitions = new List<PhaseTransitionDto>();
            
            foreach (var phase in phases)
            {
                // Mock transition from previous phase to current phase
                transitions.Add(new PhaseTransitionDto
                {
                    Date = phase.CompletedDate!.Value,
                    FromPhaseId = phase.PhaseId - 1 > 0 ? phase.PhaseId - 1 : 1, // Mock previous phase
                    ToPhaseId = phase.PhaseId,
                    FromPhaseName = $"Phase {phase.PhaseId - 1}",
                    ToPhaseName = phase.Phase.PhaseName
                });
            }

            return transitions;
        }
    }
}