using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication;

namespace MusicEventManagementSystem.PerformerCommunication.API.Services
{
    public class PhaseService : IPhaseService
    {
        private readonly IPhaseRepository _phaseRepository;

        public PhaseService(IPhaseRepository phaseRepository)
        {
            _phaseRepository = phaseRepository;
        }

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
            var existingPhase = await _phaseRepository.GetByIdAsync(id);
            if (existingPhase == null)
            {
                return null;
            }

            existingPhase.PhaseName = phase.PhaseName;
            existingPhase.OrderNumber = phase.OrderNumber;
            existingPhase.EstimatedDuration = phase.EstimatedDuration;

            _phaseRepository.Update(existingPhase);
            await _phaseRepository.SaveChangesAsync();
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
    }
}
