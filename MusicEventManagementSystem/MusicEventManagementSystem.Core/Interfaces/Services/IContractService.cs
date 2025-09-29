using MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication;

namespace MusicEventManagementSystem.Core.Interfaces.Services
{
    public interface IContractService
    {
        Task<IEnumerable<Contract>> GetAllContractsAsync();
        Task<Contract?> GetContractByIdAsync(int id);
        Task<Contract> CreateContractAsync(Contract contract);
        Task<Contract?> UpdateContractAsync(int id, Contract contract);
        Task<bool> DeleteContractAsync(int id);
    }
}
