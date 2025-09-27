using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.DTOs;

namespace MusicEventManagementSystem.API.Services.IService
{
    public interface INegotiationService
    {
        Task<IEnumerable<Negotiation>> GetAllNegotiationsAsync();
        Task<Negotiation?> GetNegotiationByIdAsync(int id);
        Task<Negotiation> CreateNegotiationAsync(Negotiation negotiation);
        Task<Negotiation?> UpdateNegotiationAsync(int id, Negotiation negotiation);
        Task<bool> DeleteNegotiationAsync(int id);

        // Existing relationship methods
        Task<NegotiationWithDetailsDto?> GetNegotiationWithDetailsAsync(int id);
        Task<IEnumerable<NegotiationDto>> GetNegotiationsWithBasicDetailsAsync();
        Task<IEnumerable<NegotiationDto>> GetNegotiationsByEventIdAsync(int eventId);
        Task<IEnumerable<NegotiationDto>> GetNegotiationsByPerformerIdAsync(int performerId);
        Task<bool> AddUserToNegotiationAsync(int negotiationId, string userId);
        Task<bool> RemoveUserFromNegotiationAsync(int negotiationId, string userId);
        Task<Negotiation> CreateNegotiationWithRelationshipsAsync(CreateNegotiationDto createDto);
        Task<Negotiation?> UpdateNegotiationWithRelationshipsAsync(int id, UpdateNegotiationDto updateDto);

        // Phase management methods
        Task<int> GetCurrentPhaseOrderAsync(int negotiationId);
        Task<bool> AdvanceNegotiationPhaseAsync(int negotiationId);
        Task<bool> UpdateNegotiationPhaseOrderAsync(int negotiationId, int newPhaseOrder);
        Task<NegotiationPhase?> GetCurrentPhaseAsync(int negotiationId);
        Task<IEnumerable<NegotiationPhase>> GetNegotiationPhaseHistoryAsync(int negotiationId);

        // Requirement fulfillment methods
        Task<IEnumerable<NegotiationRequirementFulfillment>> GetNegotiationRequirementsAsync(int negotiationId);
        Task<bool> FulfillRequirementAsync(int negotiationId, int requirementId, bool isFulfilled = true);
        Task<bool> AreAllRequirementsFulfilledForPhaseAsync(int negotiationId, int phaseId);
        Task<decimal> GetPhaseCompletionPercentageAsync(int negotiationId, int phaseId);
    }
}
