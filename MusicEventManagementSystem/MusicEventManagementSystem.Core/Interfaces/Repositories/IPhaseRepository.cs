using MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication;

namespace MusicEventManagementSystem.Core.Interfaces.Repositories
{
    public interface IPhaseRepository : IRepository<Phase>
    {
        Task<Phase?> GetPhaseWithRequirementsAsync(int id);
        Task<IEnumerable<Phase>> GetPhasesByNegotiationIdAsync(int negotiationId);
        Task<IEnumerable<Phase>> GetPhasesByContractIdAsync(int contractId);
        Task<IEnumerable<Phase>> GetPhasesWithRequirementsAsync();
    }
}
