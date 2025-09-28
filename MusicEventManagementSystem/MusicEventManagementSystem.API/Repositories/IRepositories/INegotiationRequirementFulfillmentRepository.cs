using MusicEventManagementSystem.API.Models;

namespace MusicEventManagementSystem.API.Repositories.IRepositories
{
    public interface INegotiationRequirementFulfillmentRepository : IRepository<NegotiationRequirementFulfillment>
    {
        Task<IEnumerable<NegotiationRequirementFulfillment>> GetNegotiationRequirementsAsync(int negotiationId);
        Task<IEnumerable<NegotiationRequirementFulfillment>> GetNegotiationRequirementsByPhaseAsync(int negotiationId, int phaseId);
        Task<NegotiationRequirementFulfillment?> GetRequirementFulfillmentAsync(int negotiationId, int requirementId);
        Task<bool> UpdateFulfillmentStatusAsync(int negotiationId, int requirementId, bool isFulfilled, string? fulfilledBy = null, string? notes = null, string? evidence = null);
        Task<bool> AreAllRequirementsFulfilledForPhaseAsync(int negotiationId, int phaseId);
        Task<decimal> GetPhaseCompletionPercentageAsync(int negotiationId, int phaseId);
        Task<int> GetFulfilledRequirementsCountForPhaseAsync(int negotiationId, int phaseId);
        Task<int> GetTotalRequirementsCountForPhaseAsync(int negotiationId, int phaseId);
    }
}