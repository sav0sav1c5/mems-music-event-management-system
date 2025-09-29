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

        public async Task<IEnumerable<PerformerResponseDto>> GetAllPerformersAsync()
        {
            var performers = await _performerRepository.GetAllAsync();
            return performers.Select(MapToDto);
        }

        public async Task<PerformerResponseDto?> GetPerformerByIdAsync(int id)
        {
            var performer = await _performerRepository.GetByIdAsync(id);
            return performer == null ? null : MapToDto(performer);
        }

        public async Task<PerformerResponseDto> CreatePerformerAsync(CreatePerformerDto performerDto)
        {
            var newPerformer = new Performer
            {
                Name = performerDto.Name,
                Contact = performerDto.Contact,
                Email = performerDto.Email,
                Genre = performerDto.Genre,
                Popularity = performerDto.Popularity,
                TechnicalRequirements = performerDto.TechnicalRequirements,
                MinPrice = performerDto.MinPrice,
                MaxPrice = performerDto.MaxPrice,
                AverageResponseTime = performerDto.AverageResponseTime,
                Status = performerDto.Status,
                UpdatedAt = DateTime.UtcNow
            };

            await _performerRepository.AddAsync(newPerformer);
            await _performerRepository.SaveChangesAsync();

            return MapToDto(newPerformer);
        }

        public async Task<PerformerResponseDto?> UpdatePerformerAsync(int id, UpdatePerformerDto performerDto)
        {
            var existingPerformer = await _performerRepository.GetByIdAsync(id);
            if (existingPerformer == null)
            {
                return null;
            }

            if (!string.IsNullOrEmpty(performerDto.Name))
                existingPerformer.Name = performerDto.Name;

            if (!string.IsNullOrEmpty(performerDto.Email))
                existingPerformer.Email = performerDto.Email;

            if (!string.IsNullOrEmpty(performerDto.Contact))
                existingPerformer.Contact = performerDto.Contact;

            if (!string.IsNullOrEmpty(performerDto.Genre))
                existingPerformer.Genre = performerDto.Genre;

            if (performerDto.Popularity > 0)
                existingPerformer.Popularity = performerDto.Popularity;

            if (!string.IsNullOrEmpty(performerDto.TechnicalRequirements))
                existingPerformer.TechnicalRequirements = performerDto.TechnicalRequirements;

            if (performerDto.MinPrice > 0)
                existingPerformer.MinPrice = performerDto.MinPrice;

            if (performerDto.MaxPrice > 0)
                existingPerformer.MaxPrice = performerDto.MaxPrice;

            if (performerDto.AverageResponseTime != TimeSpan.Zero)
                existingPerformer.AverageResponseTime = performerDto.AverageResponseTime;

            if (!string.IsNullOrEmpty(performerDto.Status))
                existingPerformer.Status = performerDto.Status;

            existingPerformer.UpdatedAt = DateTime.UtcNow;

            _performerRepository.Update(existingPerformer);
            await _performerRepository.SaveChangesAsync();

            return MapToDto(existingPerformer);
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

        public async Task<PerformerResponseDto?> GetByNameAsync(string name)
        {
            var performer = await _performerRepository.GetByNameAsync(name);
            return performer == null ? null : MapToDto(performer);
        }

        public async Task<IEnumerable<PerformerResponseDto>> GetByGenreAsync(string genre)
        {
            var performers = await _performerRepository.GetByGenreAsync(genre);
            return performers.Select(MapToDto);
        }

        // Helper method for mapping
        private static PerformerResponseDto MapToDto(Performer performer)
        {
            return new PerformerResponseDto
            {
                PerformerId = performer.PerformerId,
                Name = performer.Name,
                Email = performer.Email,
                Contact = performer.Contact ?? string.Empty,
                Genre = performer.Genre,
                Popularity = performer.Popularity,
                TechnicalRequirements = performer.TechnicalRequirements,
                MinPrice = performer.MinPrice,
                MaxPrice = performer.MaxPrice,
                AverageResponseTime = performer.AverageResponseTime,
                Status = performer.Status,
                Contracts = performer.Contracts?.Select(c => new ContractDto
                {
                    ContractId = c.ContractId,
                    PerformerId = c.PerformerId,
                    // Map other contract properties as needed
                }).ToList()
            };
        }
    }
}