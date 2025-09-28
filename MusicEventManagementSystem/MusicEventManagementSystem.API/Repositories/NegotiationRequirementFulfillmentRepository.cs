using Microsoft.EntityFrameworkCore;
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.Data;

namespace MusicEventManagementSystem.API.Repositories
{
    public class NegotiationRequirementFulfillmentRepository : Repository<NegotiationRequirementFulfillment>, INegotiationRequirementFulfillmentRepository
    {
        public NegotiationRequirementFulfillmentRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<NegotiationRequirementFulfillment>> GetNegotiationRequirementsAsync(int negotiationId)
        {
            return await _dbSet
                .Where(nrf => nrf.NegotiationId == negotiationId)
                .Include(nrf => nrf.Requirement)
                .Include(nrf => nrf.Phase)
                .OrderBy(nrf => nrf.Phase.OrderNumber)
                .ThenBy(nrf => nrf.Requirement.Title)
                .ToListAsync();
        }

        public async Task<IEnumerable<NegotiationRequirementFulfillment>> GetNegotiationRequirementsByPhaseAsync(int negotiationId, int phaseId)
        {
            return await _dbSet
                .Where(nrf => nrf.NegotiationId == negotiationId && nrf.PhaseId == phaseId)
                .Include(nrf => nrf.Requirement)
                .Include(nrf => nrf.Phase)
                .OrderBy(nrf => nrf.Requirement.Title)
                .ToListAsync();
        }

        public async Task<NegotiationRequirementFulfillment?> GetRequirementFulfillmentAsync(int negotiationId, int requirementId)
        {
            return await _dbSet
                .Where(nrf => nrf.NegotiationId == negotiationId && nrf.RequirementId == requirementId)
                .Include(nrf => nrf.Requirement)
                .Include(nrf => nrf.Phase)
                .FirstOrDefaultAsync();
        }

        public async Task<bool> UpdateFulfillmentStatusAsync(int negotiationId, int requirementId, bool isFulfilled, string? fulfilledBy = null, string? notes = null, string? evidence = null)
        {
            var fulfillment = await _dbSet
                .FirstOrDefaultAsync(nrf => nrf.NegotiationId == negotiationId && nrf.RequirementId == requirementId);

            if (fulfillment == null) return false;

            fulfillment.IsFulfilled = isFulfilled;
            fulfillment.FulfilledDate = isFulfilled ? DateTime.UtcNow : null;
            fulfillment.FulfilledBy = fulfilledBy;
            fulfillment.Notes = notes;
            fulfillment.Evidence = evidence;

            return true;
        }

        public async Task<bool> AreAllRequirementsFulfilledForPhaseAsync(int negotiationId, int phaseId)
        {
            var requirements = await _dbSet
                .Where(nrf => nrf.NegotiationId == negotiationId && nrf.PhaseId == phaseId)
                .ToListAsync();

            return requirements.Any() && requirements.All(nrf => nrf.IsFulfilled);
        }

        public async Task<decimal> GetPhaseCompletionPercentageAsync(int negotiationId, int phaseId)
        {
            var requirements = await _dbSet
                .Where(nrf => nrf.NegotiationId == negotiationId && nrf.PhaseId == phaseId)
                .ToListAsync();

            if (!requirements.Any()) return 0;

            var fulfilledCount = requirements.Count(nrf => nrf.IsFulfilled);
            return Math.Round((decimal)fulfilledCount / requirements.Count * 100, 2);
        }

        public async Task<int> GetFulfilledRequirementsCountForPhaseAsync(int negotiationId, int phaseId)
        {
            return await _dbSet
                .CountAsync(nrf => nrf.NegotiationId == negotiationId && nrf.PhaseId == phaseId && nrf.IsFulfilled);
        }

        public async Task<int> GetTotalRequirementsCountForPhaseAsync(int negotiationId, int phaseId)
        {
            return await _dbSet
                .CountAsync(nrf => nrf.NegotiationId == negotiationId && nrf.PhaseId == phaseId);
        }
    }
}