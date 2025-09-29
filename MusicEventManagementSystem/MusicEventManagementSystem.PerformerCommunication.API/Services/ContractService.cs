using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication;

namespace MusicEventManagementSystem.PerformerCommunication.API.Services
{
    public class ContractService : IContractService
    {
        private readonly IContractRepository _contractRepository;

        public ContractService(IContractRepository contractRepository)
        {
            _contractRepository = contractRepository;
        }

        public async Task<IEnumerable<Contract>> GetAllContractsAsync()
        {
            return await _contractRepository.GetAllAsync();
        }

        public async Task<Contract?> GetContractByIdAsync(int id)
        {
            return await _contractRepository.GetByIdAsync(id);
        }

        public async Task<Contract> CreateContractAsync(Contract contract)
        {
            contract.CreatedAt = DateTime.Now;
            await _contractRepository.AddAsync(contract);
            await _contractRepository.SaveChangesAsync();
            return contract;
        }

        public async Task<Contract?> UpdateContractAsync(int id, Contract contract)
        {
            var existingContract = await _contractRepository.GetByIdAsync(id);
            if (existingContract == null)
            {
                return null;
            }

            existingContract.Title = contract.Title;
            existingContract.ContractType = contract.ContractType;
            existingContract.Price = contract.Price;
            existingContract.Version = contract.Version;
            existingContract.Status = contract.Status;
            existingContract.SignedAt = contract.SignedAt;

            _contractRepository.Update(existingContract);
            await _contractRepository.SaveChangesAsync();
            return existingContract;
        }

        public async Task<bool> DeleteContractAsync(int id)
        {
            var contract = await _contractRepository.GetByIdAsync(id);
            if (contract == null)
            {
                return false;
            }

            _contractRepository.Delete(contract);
            await _contractRepository.SaveChangesAsync();
            return true;
        }
    }
}
