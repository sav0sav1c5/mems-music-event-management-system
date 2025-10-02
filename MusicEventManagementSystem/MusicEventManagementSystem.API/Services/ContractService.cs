using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.API.Services.IService;
using MusicEventManagementSystem.API.DTOs;

namespace MusicEventManagementSystem.API.Services
{
    public class ContractService : IContractService
    {
        private readonly IContractRepository _contractRepository;
        private readonly INegotiationRepository _negotiationRepository;
        private readonly INegotiationPhaseRepository _negotiationPhaseRepository;

        public ContractService(
            IContractRepository contractRepository,
            INegotiationRepository negotiationRepository,
            INegotiationPhaseRepository negotiationPhaseRepository)
        {
            _contractRepository = contractRepository;
            _negotiationRepository = negotiationRepository;
            _negotiationPhaseRepository = negotiationPhaseRepository;
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
            contract.CreatedAt = DateTime.UtcNow;
            await _contractRepository.AddAsync(contract);
            await _contractRepository.SaveChangesAsync();
            return contract;
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

        public async Task<ContractDto> CreateContractDraftFromNegotiationAsync(int negotiationId)
        {
            try
            {
                Console.WriteLine($"DEBUG: Starting contract creation for negotiation {negotiationId}");
                
                // Get negotiation with performer and event details
                var negotiation = await _negotiationRepository.GetNegotiationWithDetailsAsync(negotiationId);
                if (negotiation == null)
                {
                    Console.WriteLine($"DEBUG: Negotiation {negotiationId} not found");
                    throw new ArgumentException($"Negotiation with ID {negotiationId} not found.");
                }

                Console.WriteLine($"DEBUG: Found negotiation {negotiationId}, performer: {negotiation.Performer?.Name}, event: {negotiation.Event?.Name}");

                // Get current phase for debugging
                var currentPhase = await _negotiationPhaseRepository.GetCurrentNegotiationPhaseAsync(negotiationId);
                Console.WriteLine($"DEBUG: Current phase: {currentPhase?.PhaseId} - {currentPhase?.Phase?.PhaseName}");
                
                // Temporary: Allow contract creation in any phase for testing
                // TODO: Re-enable phase validation once testing is complete
                /*
                // Validate phase - only allow contract draft creation in phases 3, 4, or 5
                if (currentPhase == null || !IsPhaseAllowedForContractEditing(currentPhase.PhaseId))
                {
                    throw new InvalidOperationException($"Contract can only be created/edited in Contract Negotiations (3), Contract Draft (4), or Final Agreement (5) phases. Current phase: {currentPhase?.PhaseId}");
                }
                */

                // Create contract draft with both performer and event information
                var contract = new Contract
                {
                    Title = $"Performance Contract - {negotiation.Performer?.Name ?? "Performer"} at {negotiation.Event?.Name ?? "Event"}",
                    ContractType = "Performance",
                    Price = negotiation.ProposedFee,
                    Version = "1.0",
                    Status = "Draft",
                    CreatedAt = DateTime.UtcNow,
                    PerformerId = negotiation.PerformerId,
                    EventId = negotiation.EventId,
                    // Initialize banking fields to avoid database issues
                    BankName = "",
                    BankAccountNumber = "",
                    BankRoutingNumber = "",
                    BankAccountHolderName = "",
                    BankIBAN = "",
                    BankSWIFT = ""
                };

                Console.WriteLine($"DEBUG: About to save contract to database");
                await _contractRepository.AddAsync(contract);
                await _contractRepository.SaveChangesAsync();
                
                Console.WriteLine($"DEBUG: Contract saved successfully with ID: {contract.ContractId}");
                
                // Reload with navigation properties
                var savedContract = await _contractRepository.GetByIdAsync(contract.ContractId);
                return MapToContractDto(savedContract!);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DEBUG: Error creating contract: {ex.Message}");
                Console.WriteLine($"DEBUG: Stack trace: {ex.StackTrace}");
                throw;
            }
        }

        public async Task<ContractDto?> GetContractWithDetailsAsync(int contractId)
        {
            var contract = await _contractRepository.GetByIdAsync(contractId);
            if (contract == null) return null;

            return MapToContractDto(contract);
        }

        public async Task<ContractDto?> UpdateContractAsync(int contractId, UpdateContractDto updateDto)
        {
            var existingContract = await _contractRepository.GetByIdAsync(contractId);
            if (existingContract == null) return null;

            // TODO: Add phase validation - for now allow editing to test functionality
            // In production, you would check the current negotiation phase here

            // Update only provided fields (null means don't update)
            if (updateDto.Title != null) existingContract.Title = updateDto.Title;
            if (updateDto.ContractType != null) existingContract.ContractType = updateDto.ContractType;
            if (updateDto.Price.HasValue) existingContract.Price = updateDto.Price.Value;
            if (updateDto.Version != null) existingContract.Version = updateDto.Version;
            if (updateDto.Status != null) existingContract.Status = updateDto.Status;
            if (updateDto.SignedAt.HasValue) existingContract.SignedAt = updateDto.SignedAt;

            // Document information
            if (updateDto.ContractFilePath != null) existingContract.ContractFilePath = updateDto.ContractFilePath;
            if (updateDto.FinalVersionDate.HasValue) existingContract.FinalVersionDate = updateDto.FinalVersionDate;

            // Requirements
            if (updateDto.TechnicalRequirements != null) existingContract.TechnicalRequirements = updateDto.TechnicalRequirements;
            if (updateDto.AccommodationRequirements != null) existingContract.AccommodationRequirements = updateDto.AccommodationRequirements;

            // Payment information
            if (updateDto.DepositAmount.HasValue) existingContract.DepositAmount = updateDto.DepositAmount;
            if (updateDto.FinalPaymentAmount.HasValue) existingContract.FinalPaymentAmount = updateDto.FinalPaymentAmount;
            if (updateDto.DepositDueDate.HasValue) existingContract.DepositDueDate = updateDto.DepositDueDate;
            if (updateDto.FinalPaymentDueDate.HasValue) existingContract.FinalPaymentDueDate = updateDto.FinalPaymentDueDate;
            if (updateDto.PaymentMethod != null) existingContract.PaymentMethod = updateDto.PaymentMethod;
            if (updateDto.IsDepositPaid.HasValue) existingContract.IsDepositPaid = updateDto.IsDepositPaid.Value;
            if (updateDto.IsFinalPaymentPaid.HasValue) existingContract.IsFinalPaymentPaid = updateDto.IsFinalPaymentPaid.Value;

            // Banking information
            if (updateDto.BankName != null) existingContract.BankName = updateDto.BankName;
            if (updateDto.BankAccountNumber != null) existingContract.BankAccountNumber = updateDto.BankAccountNumber;
            if (updateDto.BankRoutingNumber != null) existingContract.BankRoutingNumber = updateDto.BankRoutingNumber;
            if (updateDto.BankAccountHolderName != null) existingContract.BankAccountHolderName = updateDto.BankAccountHolderName;
            if (updateDto.BankIBAN != null) existingContract.BankIBAN = updateDto.BankIBAN;
            if (updateDto.BankSWIFT != null) existingContract.BankSWIFT = updateDto.BankSWIFT;

            // Review information
            if (updateDto.ReviewedByStakeholders.HasValue) existingContract.ReviewedByStakeholders = updateDto.ReviewedByStakeholders.Value;
            if (updateDto.StakeholderReviewDate.HasValue) existingContract.StakeholderReviewDate = updateDto.StakeholderReviewDate;

            // Notes
            if (updateDto.Notes != null) existingContract.Notes = updateDto.Notes;

            _contractRepository.Update(existingContract);
            await _contractRepository.SaveChangesAsync();

            return MapToContractDto(existingContract);
        }

        private static bool IsPhaseAllowedForContractEditing(int phaseId)
        {
            // Phase 3: Contract Negotiations
            // Phase 4: Contract Draft  
            // Phase 5: Final Agreement
            return phaseId == 3 || phaseId == 4 || phaseId == 5;
        }

        // Helper method to map Contract to ContractDto
        private static ContractDto MapToContractDto(Contract contract)
        {
            return new ContractDto
            {
                ContractId = contract.ContractId,
                Title = contract.Title,
                ContractType = contract.ContractType,
                Price = contract.Price,
                Version = contract.Version,
                Status = contract.Status,
                CreatedAt = contract.CreatedAt,
                SignedAt = contract.SignedAt,

                // Contract Document Information
                ContractFilePath = contract.ContractFilePath,
                FinalVersionDate = contract.FinalVersionDate,

                // Requirements
                TechnicalRequirements = contract.TechnicalRequirements,
                AccommodationRequirements = contract.AccommodationRequirements,

                // Payment Information
                DepositAmount = contract.DepositAmount,
                FinalPaymentAmount = contract.FinalPaymentAmount,
                DepositDueDate = contract.DepositDueDate,
                FinalPaymentDueDate = contract.FinalPaymentDueDate,
                PaymentMethod = contract.PaymentMethod,
                IsDepositPaid = contract.IsDepositPaid,
                IsFinalPaymentPaid = contract.IsFinalPaymentPaid,

                // Banking Information
                BankName = contract.BankName,
                BankAccountNumber = contract.BankAccountNumber,
                BankRoutingNumber = contract.BankRoutingNumber,
                BankAccountHolderName = contract.BankAccountHolderName,
                BankIBAN = contract.BankIBAN,
                BankSWIFT = contract.BankSWIFT,

                // Review Information
                ReviewedByStakeholders = contract.ReviewedByStakeholders,
                StakeholderReviewDate = contract.StakeholderReviewDate,

                // Notes
                Notes = contract.Notes,

                // Related entities (populated from navigation properties)
                PerformerId = contract.PerformerId,
                PerformerName = contract.Performer?.Name,
                EventId = contract.EventId,
                EventTitle = contract.Event?.Name,
                EventDate = contract.Event?.Interval,
                EventLocation = contract.Event?.Location?.Name ?? (contract.Event?.LocationId != null ? $"Location ID: {contract.Event.LocationId}" : null)
            };
        }

        public async Task<IEnumerable<ContractDto>> GetContractsByNegotiationAsync(int negotiationId)
        {
            try
            {
                // Get negotiation to find performer and event IDs
                var negotiation = await _negotiationRepository.GetNegotiationWithDetailsAsync(negotiationId);
                if (negotiation == null)
                {
                    return new List<ContractDto>();
                }

                // Get all contracts that match this negotiation's performer and event
                var allContracts = await _contractRepository.GetAllAsync();
                var matchingContracts = allContracts
                    .Where(c => c.PerformerId == negotiation.PerformerId && c.EventId == negotiation.EventId)
                    .ToList();

                return matchingContracts.Select(MapToContractDto);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DEBUG: Error getting contracts for negotiation {negotiationId}: {ex.Message}");
                throw;
            }
        }
    }
}
