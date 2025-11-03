using MusicEventManagementSystem.Data;
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.API.Services.IService;
using Microsoft.EntityFrameworkCore;

namespace MusicEventManagementSystem.API.Services
{
    public class FulfillmentService : IFulfillmentService
    {
        private readonly ApplicationDbContext _context;
        private readonly INegotiationRequirementFulfillmentRepository _fulfillmentRepository;
        private readonly INegotiationRepository _negotiationRepository;
        private readonly IContractRepository _contractRepository;

        public FulfillmentService(
            ApplicationDbContext context,
            INegotiationRequirementFulfillmentRepository fulfillmentRepository,
            INegotiationRepository negotiationRepository,
            IContractRepository contractRepository)
        {
            _context = context;
            _fulfillmentRepository = fulfillmentRepository;
            _negotiationRepository = negotiationRepository;
            _contractRepository = contractRepository;
        }

        public async Task<bool> UpdateFulfillmentStatusAsync(int fulfillmentId, bool isFulfilled, string fulfilledBy)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                // Load the Fulfillment entity with its Requirement navigation property
                var fulfillment = await _context.NegotiationRequirementFulfillments
                    .Include(f => f.Requirement)
                    .Include(f => f.Negotiation)
                    .FirstOrDefaultAsync(f => f.FulfillmentId == fulfillmentId);

                if (fulfillment == null)
                {
                    return false;
                }

                // Update the fulfillment status
                fulfillment.IsFulfilled = isFulfilled;
                fulfillment.FulfilledBy = isFulfilled ? fulfilledBy : null;
                fulfillment.FulfilledDate = isFulfilled ? DateTime.UtcNow : null;

                // If the requirement is being marked as fulfilled and has a contract update action
                if (isFulfilled && !string.IsNullOrEmpty(fulfillment.Requirement.ContractUpdateAction))
                {
                    await UpdateContractBasedOnRequirementAsync(fulfillment);
                }

                // Save all changes
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                // Log the exception (you might want to use ILogger here)
                Console.WriteLine($"Error updating fulfillment status: {ex.Message}");
                throw;
            }
        }

        private async Task UpdateContractBasedOnRequirementAsync(NegotiationRequirementFulfillment fulfillment)
        {
            // Find the associated contract by matching PerformerId and EventId from the negotiation
            var negotiation = fulfillment.Negotiation;
            var contract = await _context.Contracts
                .FirstOrDefaultAsync(c => c.PerformerId == negotiation.PerformerId && 
                                         c.EventId == negotiation.EventId);

            if (contract == null)
            {
                // Log warning but don't fail the operation
                Console.WriteLine($"Warning: No contract found for negotiation {negotiation.NegotiationId} " +
                                $"(Performer: {negotiation.PerformerId}, Event: {negotiation.EventId})");
                return;
            }

            // Update the contract based on the ContractUpdateAction
            switch (fulfillment.Requirement.ContractUpdateAction?.ToUpperInvariant())
            {
                case "UPDATE_DEPOSIT_PAID":
                    contract.IsDepositPaid = true;
                    Console.WriteLine($"Updated contract {contract.ContractId}: IsDepositPaid = true");
                    break;

                case "UPDATE_FINAL_PAYMENT_PAID":
                    contract.IsFinalPaymentPaid = true;
                    Console.WriteLine($"Updated contract {contract.ContractId}: IsFinalPaymentPaid = true");
                    break;

                case "UPDATE_STAKEHOLDER_REVIEW":
                    contract.ReviewedByStakeholders = true;
                    contract.StakeholderReviewDate = DateTime.UtcNow;
                    Console.WriteLine($"Updated contract {contract.ContractId}: ReviewedByStakeholders = true, " +
                                    $"StakeholderReviewDate = {contract.StakeholderReviewDate}");
                    break;

                case "UPDATE_CONTRACT_SIGNED":
                    contract.SignedAt = DateTime.UtcNow;
                    contract.Status = "Signed";
                    Console.WriteLine($"Updated contract {contract.ContractId}: SignedAt = {contract.SignedAt}, Status = Signed");
                    break;

                case "UPDATE_FINAL_VERSION":
                    contract.FinalVersionDate = DateTime.UtcNow;
                    contract.Status = "Final";
                    Console.WriteLine($"Updated contract {contract.ContractId}: FinalVersionDate = {contract.FinalVersionDate}, Status = Final");
                    break;

                default:
                    Console.WriteLine($"Warning: Unknown ContractUpdateAction '{fulfillment.Requirement.ContractUpdateAction}' " +
                                    $"for requirement {fulfillment.RequirementId}");
                    break;
            }

            // The contract will be saved when the main SaveChangesAsync is called
        }

        /// <summary>
        /// Updates multiple fulfillments in a single transaction
        /// </summary>
        public async Task<bool> UpdateMultipleFulfillmentStatusAsync(
            IEnumerable<(int FulfillmentId, bool IsFulfilled, string FulfilledBy)> updates)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                foreach (var (fulfillmentId, isFulfilled, fulfilledBy) in updates)
                {
                    var fulfillment = await _context.NegotiationRequirementFulfillments
                        .Include(f => f.Requirement)
                        .Include(f => f.Negotiation)
                        .FirstOrDefaultAsync(f => f.FulfillmentId == fulfillmentId);

                    if (fulfillment == null)
                    {
                        continue; // Skip missing fulfillments
                    }

                    // Update the fulfillment status
                    fulfillment.IsFulfilled = isFulfilled;
                    fulfillment.FulfilledBy = isFulfilled ? fulfilledBy : null;
                    fulfillment.FulfilledDate = isFulfilled ? DateTime.UtcNow : null;

                    // If the requirement is being marked as fulfilled and has a contract update action
                    if (isFulfilled && !string.IsNullOrEmpty(fulfillment.Requirement.ContractUpdateAction))
                    {
                        await UpdateContractBasedOnRequirementAsync(fulfillment);
                    }
                }

                // Save all changes
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"Error updating multiple fulfillment statuses: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Gets fulfillment details with requirement information
        /// </summary>
        public async Task<NegotiationRequirementFulfillment?> GetFulfillmentWithDetailsAsync(int fulfillmentId)
        {
            return await _context.NegotiationRequirementFulfillments
                .Include(f => f.Requirement)
                .Include(f => f.Negotiation)
                .Include(f => f.Phase)
                .FirstOrDefaultAsync(f => f.FulfillmentId == fulfillmentId);
        }

        /// <summary>
        /// Gets all fulfillments for a negotiation with their requirements
        /// </summary>
        public async Task<IEnumerable<NegotiationRequirementFulfillment>> GetNegotiationFulfillmentsAsync(int negotiationId)
        {
            return await _context.NegotiationRequirementFulfillments
                .Include(f => f.Requirement)
                .Include(f => f.Phase)
                .Where(f => f.NegotiationId == negotiationId)
                .OrderBy(f => f.Phase.OrderNumber)
                .ThenBy(f => f.Requirement.Title)
                .ToListAsync();
        }
    }
}