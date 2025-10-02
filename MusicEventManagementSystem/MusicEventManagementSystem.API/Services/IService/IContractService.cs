using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.DTOs;

namespace MusicEventManagementSystem.API.Services.IService
{
    public interface IContractService
    {
        Task<IEnumerable<Contract>> GetAllContractsAsync();
        Task<Contract?> GetContractByIdAsync(int id);
        Task<Contract> CreateContractAsync(Contract contract);
        Task<bool> DeleteContractAsync(int id);
        
        // Contract management for negotiation phases 3, 4, 5
        Task<ContractDto> CreateContractDraftFromNegotiationAsync(int negotiationId);
        Task<ContractDto?> GetContractWithDetailsAsync(int contractId);
        Task<ContractDto?> UpdateContractAsync(int contractId, UpdateContractDto updateDto);
        Task<IEnumerable<ContractDto>> GetContractsByNegotiationAsync(int negotiationId);
    }
}
