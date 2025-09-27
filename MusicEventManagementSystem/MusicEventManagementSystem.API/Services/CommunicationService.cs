using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.API.Services.IService;

namespace MusicEventManagementSystem.API.Services
{
    public class CommunicationService : ICommunicationService
    {
        private readonly ICommunicationRepository _communicationRepository;

        public CommunicationService(ICommunicationRepository communicationRepository)
        {
            _communicationRepository = communicationRepository;
        }

        public async Task<IEnumerable<Communication>> GetAllCommunicationsAsync()
        {
            return await _communicationRepository.GetAllAsync();
        }

        public async Task<Communication?> GetCommunicationByIdAsync(int id)
        {
            return await _communicationRepository.GetByIdAsync(id);
        }

        public async Task<Communication> CreateCommunicationAsync(Communication communication)
        {
            communication.SentAt = DateTime.UtcNow;
            await _communicationRepository.AddAsync(communication);
            await _communicationRepository.SaveChangesAsync();
            return communication;
        }

        public async Task<Communication?> UpdateCommunicationAsync(int id, Communication communication)
        {
            var existingCommunication = await _communicationRepository.GetByIdAsync(id);
            if (existingCommunication == null)
            {
                return null;
            }

            existingCommunication.Type = communication.Type;
            existingCommunication.Direction = communication.Direction;
            existingCommunication.Content = communication.Content;
            existingCommunication.RepliedAt = communication.RepliedAt;

            _communicationRepository.Update(existingCommunication);
            await _communicationRepository.SaveChangesAsync();
            return existingCommunication;
        }

        public async Task<bool> DeleteCommunicationAsync(int id)
        {
            var communication = await _communicationRepository.GetByIdAsync(id);
            if (communication == null)
            {
                return false;
            }

            _communicationRepository.Delete(communication);
            await _communicationRepository.SaveChangesAsync();
            return true;
        }
    }
}
