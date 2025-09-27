using MusicEventManagementSystem.API.Models;

namespace MusicEventManagementSystem.API.Services.IService
{
    public interface IPhaseService
    {
        // Global phase template management
        Task<IEnumerable<Phase>> GetAllPhasesAsync();
        Task<Phase?> GetPhaseByIdAsync(int id);
        Task<Phase> CreatePhaseAsync(Phase phase);
        Task<Phase?> UpdatePhaseAsync(int id, Phase phase);
        Task<bool> DeletePhaseAsync(int id);
        
        // Global phase operations
        Task<IEnumerable<Phase>> GetGlobalPhaseTemplatesAsync();
        Task<Phase?> GetPhaseByOrderAsync(int orderNumber);
        Task InitializeGlobalPhasesAsync();
        
        // Negotiation phase management
        Task<IEnumerable<NegotiationPhase>> GetNegotiationPhasesAsync(int negotiationId);
        Task<NegotiationPhase?> GetCurrentNegotiationPhaseAsync(int negotiationId);
        Task<NegotiationPhase?> GetNegotiationPhaseAsync(int negotiationId, int phaseId);
        Task InitializeNegotiationPhasesAsync(int negotiationId);
        Task<bool> AdvanceToNextPhaseAsync(int negotiationId);
        Task<bool> CompletePhaseAsync(int negotiationId, int phaseId);
        Task<bool> CanAdvanceToNextPhaseAsync(int negotiationId);
    }
}
