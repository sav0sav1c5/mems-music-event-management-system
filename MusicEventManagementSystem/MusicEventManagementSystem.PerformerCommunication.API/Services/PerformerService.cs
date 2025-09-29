using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;
using MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication;

namespace MusicEventManagementSystem.PerformerCommunication.API.Services
{
    public class PerformerService : IPerformerService
    {
        private readonly IPerformerRepository _performerRepository;

        public PerformerService(IPerformerRepository performerRepository)
        {
            _performerRepository = performerRepository;
        }

        public async Task<IEnumerable<Performer>> GetAllPerformersAsync()
        {
            return await _performerRepository.GetAllAsync();
        }

        public async Task<Performer?> GetPerformerByIdAsync(int id)
        {
            return await _performerRepository.GetByIdAsync(id);
        }

        public async Task<Performer> CreatePerformerAsync(PerformerDto performer)
        {
            var newPerformer = new Performer
            {
                Name = performer.Name,
                Contact = performer.Contact,
                Email = performer.Email,
                Genre = performer.Genre,
                Popularity = performer.Popularity,
                TechnicalRequirements = performer.TechnicalRequirements,
                MinPrice = performer.MinPrice,
                MaxPrice = performer.MaxPrice,
                AverageResponseTime = performer.AverageResponseTime,
                Status = performer.Status,
                UpdatedAt = DateTime.UtcNow
            };

            await _performerRepository.AddAsync(newPerformer);
            await _performerRepository.SaveChangesAsync();
            return newPerformer;
        }

       public async Task<Performer?> UpdatePerformerAsync(int id, PerformerDto performerDto)
        {
            var existingPerformer = await _performerRepository.GetByIdAsync(id);
            if (existingPerformer == null)
            {
                return null;
            }

            existingPerformer.Name = performerDto.Name;
            existingPerformer.Contact = performerDto.Contact;
            existingPerformer.Email = performerDto.Email;
            existingPerformer.Genre = performerDto.Genre;
            existingPerformer.Popularity = performerDto.Popularity;
            existingPerformer.TechnicalRequirements = performerDto.TechnicalRequirements;
            existingPerformer.MinPrice = performerDto.MinPrice;
            existingPerformer.MaxPrice = performerDto.MaxPrice;
            existingPerformer.AverageResponseTime = performerDto.AverageResponseTime;
            existingPerformer.Status = performerDto.Status;
            existingPerformer.UpdatedAt = DateTime.UtcNow;

            _performerRepository.Update(existingPerformer);
            await _performerRepository.SaveChangesAsync();

            return existingPerformer;
        }
        
        public async Task<bool> DeletePerformerAsync(int id)
        {
            var performer = await _performerRepository.GetByIdAsync(id);
            if (performer == null)
            {
                return false;
            }

            _performerRepository.Delete(performer);
            await _performerRepository.SaveChangesAsync();
            return true;
        }
    }
}