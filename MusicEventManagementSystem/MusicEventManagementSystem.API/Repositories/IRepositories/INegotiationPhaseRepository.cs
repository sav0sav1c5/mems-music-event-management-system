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
    }
}