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
        Task<IEnumerable<NegotiationRequirementFulfillment>> GetNegotiationRequirementsByPhaseAsync(int negotiationId, int phaseId);
        Task<bool> FulfillRequirementAsync(int negotiationId, int requirementId, bool isFulfilled = true, string? fulfilledBy = null, string? notes = null, string? evidence = null);
        Task<bool> AreAllRequirementsFulfilledForPhaseAsync(int negotiationId, int phaseId);
        Task<decimal> GetPhaseCompletionPercentageAsync(int negotiationId, int phaseId);
        
        // Communication methods
        Task<bool> AddCommunicationToNegotiationAsync(int negotiationId, string type, string direction, string content);
        Task<Communication?> GetNegotiationCommunicationAsync(int negotiationId);
        
        // Enhanced workflow methods
        Task<bool> InitializeNegotiationWorkflowAsync(int negotiationId);
        Task<bool> CanAdvanceToNextPhaseAsync(int negotiationId);
        Task<bool> CompleteNegotiationAsync(int negotiationId);
        Task<NegotiationWorkflowDto?> GetNegotiationWorkflowAsync(int negotiationId);
        
        // TEMPORARY DEBUG METHOD - REMOVE IN PRODUCTION
        Task<int> FixActivePhases();

        // Analytics methods
        Task<object> GetAnalyticsSummaryAsync(string timeRange);
        Task<IEnumerable<object>> GetPhaseDistributionAsync(string timeRange);
        Task<IEnumerable<object>> GetNegotiationTrendsAsync(string timeRange);
        Task<IEnumerable<object>> GetPerformerAnalyticsAsync(string timeRange);
        Task<IEnumerable<object>> GetRevenueByEventAsync(string timeRange);
        Task<IEnumerable<object>> GetPhaseDurationAnalysisAsync(string timeRange);
        Task<IEnumerable<object>> GetRecentActivityAsync(int limit);
    }
}
