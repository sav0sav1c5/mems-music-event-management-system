using MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication;

namespace MusicEventManagementSystem.Core.Interfaces.Services
{
    public interface IPhaseService
    {
        Task<IEnumerable<Phase>> GetAllPhasesAsync();
        Task<Phase?> GetPhaseByIdAsync(int id);
        Task<Phase> CreatePhaseAsync(Phase phase);
        Task<Phase?> UpdatePhaseAsync(int id, Phase phase);
        Task<bool> DeletePhaseAsync(int id);
    }
}
