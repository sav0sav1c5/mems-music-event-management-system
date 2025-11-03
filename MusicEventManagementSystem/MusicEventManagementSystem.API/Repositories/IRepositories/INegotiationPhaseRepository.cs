using MusicEventManagementSystem.API.Models;

namespace MusicEventManagementSystem.API.Repositories.IRepositories
{
    public interface INegotiationPhaseRepository : IRepository<NegotiationPhase>
    {
        Task<IEnumerable<NegotiationPhase>> GetNegotiationPhasesAsync(int negotiationId);
        Task<NegotiationPhase?> GetCurrentNegotiationPhaseAsync(int negotiationId);
        Task<NegotiationPhase?> GetNegotiationPhaseAsync(int negotiationId, int phaseId);
        Task<bool> SetPhaseActiveAsync(int negotiationId, int phaseId, bool isActive);
        Task<bool> UpdatePhaseStatusAsync(int negotiationId, int phaseId, string status);
        Task<bool> CompletePhaseAsync(int negotiationId, int phaseId);
        
        // Analytics methods
        Task<IEnumerable<NegotiationPhase>> GetCurrentPhasesForNegotiationsAsync(List<int> negotiationIds);
        Task<IEnumerable<NegotiationPhase>> GetPhasesByNegotiationIdsAsync(List<int> negotiationIds);
        Task<IEnumerable<NegotiationRequirementFulfillment>> GetRequirementFulfillmentsByNegotiationIdsAsync(List<int> negotiationIds);
        Task<IEnumerable<PhaseTransitionDto>> GetPhaseHistoryAsync(List<int> negotiationIds, DateTime startDate, DateTime endDate);
    }
}

// DTO for phase transitions
public class PhaseTransitionDto
{
    public DateTime Date { get; set; }
    public int FromPhaseId { get; set; }
    public int ToPhaseId { get; set; }
    public string FromPhaseName { get; set; } = "";
    public string ToPhaseName { get; set; } = "";
}