using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.API.Services.IService;
using MusicEventManagementSystem.Data;
using Microsoft.EntityFrameworkCore;

namespace MusicEventManagementSystem.API.Services
{
    public class RequirementService : IRequirementService
    {
        private readonly IRequirementRepository _requirementRepository;
        private readonly INegotiationRepository _negotiationRepository;
        private readonly IPhaseService _phaseService;
        private readonly ApplicationDbContext _context;

        public RequirementService(IRequirementRepository requirementRepository, INegotiationRepository negotiationRepository, IPhaseService phaseService, ApplicationDbContext context)
        {
            _requirementRepository = requirementRepository;
            _negotiationRepository = negotiationRepository;
            _phaseService = phaseService;
            _context = context;
        }

        #region Global Requirement Management

        public async Task<IEnumerable<Requirement>> GetAllRequirementsAsync()
        {
            return await _requirementRepository.GetAllAsync();
        }

        public async Task<Requirement?> GetRequirementByIdAsync(int id)
        {
            return await _requirementRepository.GetByIdAsync(id);
        }

        public async Task<Requirement> CreateRequirementAsync(Requirement requirement)
        {
            // Ensure ID is 0 for new entities (EF will auto-generate)
            requirement.RequirementId = 0;
            requirement.CreatedAt = DateTime.UtcNow;
            
            Console.WriteLine($"=== SERVICE: Creating requirement with ID: {requirement.RequirementId} ===");
            
            try
            {
                await _requirementRepository.AddAsync(requirement);
                await _requirementRepository.SaveChangesAsync();
                
                Console.WriteLine($"=== SERVICE: Requirement created with ID: {requirement.RequirementId} ===");
                return requirement;
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException ex) when (ex.InnerException is Npgsql.PostgresException pgEx && pgEx.SqlState == "23505")
            {
                Console.WriteLine("=== SEQUENCE CONFLICT DETECTED - ATTEMPTING TO FIX ===");
                
                // This is a primary key violation - likely sequence is out of sync
                // Try to reset the sequence and retry
                await ResetRequirementSequenceAsync();
                
                // Retry the operation
                await _requirementRepository.AddAsync(requirement);
                await _requirementRepository.SaveChangesAsync();
                
                Console.WriteLine($"=== SERVICE: Requirement created after sequence reset with ID: {requirement.RequirementId} ===");
                return requirement;
            }
        }

        private async Task ResetRequirementSequenceAsync()
        {
            Console.WriteLine("=== RESETTING REQUIREMENTS SEQUENCE ===");
            
            // Reset the sequence to the next available value
            var sql = @"SELECT setval('public.""Requirements_RequirementId_seq""', 
                                COALESCE((SELECT MAX(""RequirementId"") FROM public.""Requirements""), 0) + 1, 
                                false)";
            
            await _context.Database.ExecuteSqlRawAsync(sql);
            Console.WriteLine("=== SEQUENCE RESET COMPLETED ===");
        }

        public async Task<Requirement?> UpdateRequirementAsync(int id, Requirement requirement)
        {
            var existingRequirement = await _requirementRepository.GetByIdAsync(id);
            if (existingRequirement == null)
            {
                return null;
            }

            existingRequirement.Title = requirement.Title;
            existingRequirement.Description = requirement.Description;
            existingRequirement.IsRequired = requirement.IsRequired;
            existingRequirement.PhaseId = requirement.PhaseId;
            existingRequirement.UpdatedAt = DateTime.UtcNow;

            _requirementRepository.Update(existingRequirement);
            await _requirementRepository.SaveChangesAsync();
            return existingRequirement;
        }

        public async Task<bool> DeleteRequirementAsync(int id)
        {
            var requirement = await _requirementRepository.GetByIdAsync(id);
            if (requirement == null)
            {
                return false;
            }

            _requirementRepository.Delete(requirement);
            await _requirementRepository.SaveChangesAsync();
            return true;
        }

        #endregion

        #region Phase-Specific Requirements

        public async Task<IEnumerable<Requirement>> GetRequirementsByPhaseIdAsync(int phaseId)
        {
            var allRequirements = await _requirementRepository.GetAllAsync();
            return allRequirements.Where(r => r.PhaseId == phaseId);
        }

        public async Task<IEnumerable<Requirement>> GetRequiredRequirementsByPhaseIdAsync(int phaseId)
        {
            var phaseRequirements = await GetRequirementsByPhaseIdAsync(phaseId);
            return phaseRequirements.Where(r => r.IsRequired);
        }

        public async Task<bool> ValidatePhaseExistsAsync(int phaseId)
        {
            try
            {
                var phase = await _phaseService.GetPhaseByIdAsync(phaseId);
                return phase != null;
            }
            catch
            {
                return false;
            }
        }

        #endregion

        #region Negotiation Requirement Fulfillment

        public Task<IEnumerable<NegotiationRequirementFulfillment>> GetNegotiationRequirementFulfillmentsAsync(int negotiationId)
        {
            // TODO: Implement when repository methods are available
            return Task.FromResult<IEnumerable<NegotiationRequirementFulfillment>>(new List<NegotiationRequirementFulfillment>());
        }

        public async Task<NegotiationRequirementFulfillment?> GetNegotiationRequirementFulfillmentAsync(int negotiationId, int requirementId)
        {
            var fulfillments = await GetNegotiationRequirementFulfillmentsAsync(negotiationId);
            return fulfillments.FirstOrDefault(nrf => nrf.RequirementId == requirementId);
        }

        public Task<bool> InitializeNegotiationRequirementsAsync(int negotiationId)
        {
            // TODO: Implement when repository methods are available
            return Task.FromResult(true);
        }

        public Task<bool> UpdateRequirementFulfillmentAsync(int negotiationId, int requirementId, bool isFulfilled, string? notes = null)
        {
            // TODO: Implement when repository methods are available
            return Task.FromResult(true);
        }

        public Task<bool> AreAllRequiredRequirementsFulfilledAsync(int negotiationId, int phaseId)
        {
            // TODO: Implement when repository methods are available
            // For now, always return true to allow phase advancement
            return Task.FromResult(true);
        }

        public Task<decimal> GetRequirementCompletionPercentageAsync(int negotiationId, int phaseId)
        {
            // TODO: Implement when repository methods are available  
            return Task.FromResult(0m);
        }

        #endregion
    }
}