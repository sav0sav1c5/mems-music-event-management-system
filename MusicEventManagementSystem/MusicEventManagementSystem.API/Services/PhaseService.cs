using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.API.Services.IService;

namespace MusicEventManagementSystem.API.Services
{
    public class PhaseService : IPhaseService
    {
        private readonly IPhaseRepository _phaseRepository;
        private readonly INegotiationRepository _negotiationRepository;

        public PhaseService(IPhaseRepository phaseRepository, INegotiationRepository negotiationRepository)
        {
            _phaseRepository = phaseRepository;
            _negotiationRepository = negotiationRepository;
        }

        #region Global Phase Template Management

        public async Task<IEnumerable<Phase>> GetAllPhasesAsync()
        {
            return await _phaseRepository.GetAllAsync();
        }

        public async Task<Phase?> GetPhaseByIdAsync(int id)
        {
            return await _phaseRepository.GetByIdAsync(id);
        }

        public async Task<Phase> CreatePhaseAsync(Phase phase)
        {
            await _phaseRepository.AddAsync(phase);
            await _phaseRepository.SaveChangesAsync();
            return phase;
        }

        public async Task<Phase?> UpdatePhaseAsync(int id, Phase phase)
        {
            Console.WriteLine($"=== PHASE SERVICE: UpdatePhaseAsync called for ID: {id} ===");
            
            var existingPhase = await _phaseRepository.GetByIdAsync(id);
            if (existingPhase == null)
            {
                Console.WriteLine($"=== PHASE SERVICE: Phase not found with ID: {id} ===");
                return null;
            }

            Console.WriteLine($"=== PHASE SERVICE: Found existing phase - Name: {existingPhase.PhaseName} ===");
            Console.WriteLine($"=== PHASE SERVICE: Updating with new values ===");
            Console.WriteLine($"Old Name: '{existingPhase.PhaseName}' -> New Name: '{phase.PhaseName}'");
            Console.WriteLine($"Old Description: '{existingPhase.Description}' -> New Description: '{phase.Description}'");

            existingPhase.PhaseName = phase.PhaseName;
            existingPhase.Description = phase.Description;
            existingPhase.OrderNumber = phase.OrderNumber;
            existingPhase.EstimatedDuration = phase.EstimatedDuration;
            existingPhase.IsGlobal = phase.IsGlobal;

            Console.WriteLine($"=== PHASE SERVICE: Calling repository update ===");
            _phaseRepository.Update(existingPhase);
            
            Console.WriteLine($"=== PHASE SERVICE: Saving changes ===");
            await _phaseRepository.SaveChangesAsync();
            
            Console.WriteLine($"=== PHASE SERVICE: Update completed successfully ===");
            return existingPhase;
        }

        public async Task<bool> DeletePhaseAsync(int id)
        {
            var phase = await _phaseRepository.GetByIdAsync(id);
            if (phase == null)
            {
                return false;
            }

            _phaseRepository.Delete(phase);
            await _phaseRepository.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Phase>> GetGlobalPhaseTemplatesAsync()
        {
            var allPhases = await _phaseRepository.GetAllAsync();
            return allPhases.Where(p => p.IsGlobal).OrderBy(p => p.OrderNumber);
        }

        public async Task<Phase?> GetPhaseByOrderAsync(int orderNumber)
        {
            var globalPhases = await GetGlobalPhaseTemplatesAsync();
            return globalPhases.FirstOrDefault(p => p.OrderNumber == orderNumber);
        }

        public async Task InitializeGlobalPhasesAsync()
        {
            var existingPhases = await GetGlobalPhaseTemplatesAsync();
            if (existingPhases.Any())
            {
                return; // Global phases already exist
            }

            var globalPhases = new List<Phase>
            {
                new Phase
                {
                    PhaseName = "Initial Contact",
                    Description = "First contact and initial negotiations",
                    OrderNumber = 1,
                    EstimatedDuration = 3,
                    IsGlobal = true
                },
                new Phase
                {
                    PhaseName = "Proposal Review",
                    Description = "Review and evaluation of proposals",
                    OrderNumber = 2,
                    EstimatedDuration = 5,
                    IsGlobal = true
                },
                new Phase
                {
                    PhaseName = "Contract Negotiation",
                    Description = "Contract terms and conditions negotiation",
                    OrderNumber = 3,
                    EstimatedDuration = 7,
                    IsGlobal = true
                },
                new Phase
                {
                    PhaseName = "Final Approval",
                    Description = "Final approval and sign-off",
                    OrderNumber = 4,
                    EstimatedDuration = 3,
                    IsGlobal = true
                },
                new Phase
                {
                    PhaseName = "Event Preparation",
                    Description = "Final preparations before the event",
                    OrderNumber = 5,
                    EstimatedDuration = 10,
                    IsGlobal = true
                }
            };

            foreach (var phase in globalPhases)
            {
                await _phaseRepository.AddAsync(phase);
            }
            await _phaseRepository.SaveChangesAsync();
        }

        #endregion

        #region Negotiation Phase Management

        public Task<IEnumerable<NegotiationPhase>> GetNegotiationPhasesAsync(int negotiationId)
        {
            // This will need to be implemented when repository methods are available
            // For now, return empty list
            return Task.FromResult<IEnumerable<NegotiationPhase>>(new List<NegotiationPhase>());
        }

        public Task<NegotiationPhase?> GetCurrentNegotiationPhaseAsync(int negotiationId)
        {
            // This will need to be implemented when repository methods are available
            // For now, return null
            return Task.FromResult<NegotiationPhase?>(null);
        }

        public Task<NegotiationPhase?> GetNegotiationPhaseAsync(int negotiationId, int phaseId)
        {
            // This will need to be implemented when repository methods are available
            // For now, return null
            return Task.FromResult<NegotiationPhase?>(null);
        }

        public Task InitializeNegotiationPhasesAsync(int negotiationId)
        {
            // This will need to be implemented when repository methods are available
            // For now, just return completed task
            return Task.CompletedTask;
        }

        public async Task<bool> AdvanceToNextPhaseAsync(int negotiationId)
        {
            var negotiation = await _negotiationRepository.GetByIdAsync(negotiationId);
            if (negotiation == null)
            {
                return false;
            }

            // Check if we can advance (simplified logic for now)
            if (!await CanAdvanceToNextPhaseAsync(negotiationId))
            {
                return false;
            }

            var globalPhases = await GetGlobalPhaseTemplatesAsync();
            var maxPhaseOrder = globalPhases.Max(p => p.OrderNumber);

            if (negotiation.CurrentPhaseOrder >= maxPhaseOrder)
            {
                return false; // Already at the last phase
            }

            // Advance to next phase
            negotiation.CurrentPhaseOrder++;

            _negotiationRepository.Update(negotiation);
            await _negotiationRepository.SaveChangesAsync();

            return true;
        }

        public Task<bool> CompletePhaseAsync(int negotiationId, int phaseId)
        {
            // This will need to be implemented when repository methods are available
            // For now, return true
            return Task.FromResult(true);
        }

        public Task<bool> CanAdvanceToNextPhaseAsync(int negotiationId)
        {
            // Simplified logic for now - always allow advancement
            // In a real implementation, this would check requirement fulfillment
            return Task.FromResult(true);
        }

        #endregion
    }
}