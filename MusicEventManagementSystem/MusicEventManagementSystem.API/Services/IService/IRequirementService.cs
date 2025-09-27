using MusicEventManagementSystem.API.Models;

namespace MusicEventManagementSystem.API.Services.IService
{
    public interface IRequirementService
    {
        // Global requirement management
        Task<IEnumerable<Requirement>> GetAllRequirementsAsync();
        Task<Requirement?> GetRequirementByIdAsync(int id);
        Task<Requirement> CreateRequirementAsync(Requirement requirement);
        Task<Requirement?> UpdateRequirementAsync(int id, Requirement requirement);
        Task<bool> DeleteRequirementAsync(int id);
        
        // Phase-specific requirements
        Task<IEnumerable<Requirement>> GetRequirementsByPhaseIdAsync(int phaseId);
        Task<IEnumerable<Requirement>> GetRequiredRequirementsByPhaseIdAsync(int phaseId);
        Task<bool> ValidatePhaseExistsAsync(int phaseId);
        
        // Negotiation requirement fulfillment
        Task<IEnumerable<NegotiationRequirementFulfillment>> GetNegotiationRequirementFulfillmentsAsync(int negotiationId);
        Task<NegotiationRequirementFulfillment?> GetNegotiationRequirementFulfillmentAsync(int negotiationId, int requirementId);
        Task<bool> InitializeNegotiationRequirementsAsync(int negotiationId);
        Task<bool> UpdateRequirementFulfillmentAsync(int negotiationId, int requirementId, bool isFulfilled, string? notes = null);
        Task<bool> AreAllRequiredRequirementsFulfilledAsync(int negotiationId, int phaseId);
        Task<decimal> GetRequirementCompletionPercentageAsync(int negotiationId, int phaseId);
    }
}
