using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.EventOrganization.API.Services
{
    public class InfrastructureService : IInfrastructureService
    {
        private readonly IInfrastructureRepository _infrastructureRepository;
        private readonly IResourceRepository _resourceRepository;

        public InfrastructureService(IInfrastructureRepository infrastructureRepository, IResourceRepository resourceRepository)
        {
            _infrastructureRepository = infrastructureRepository;
            _resourceRepository = resourceRepository;
        }

        public async Task<IEnumerable<EventInfrastructure>> GetAllInfrastructuresAsync()
        {
            return await _infrastructureRepository.GetAllAsync();
        }

        public async Task<EventInfrastructure?> GetInfrastructureByIdAsync(int id)
        {
            return await _infrastructureRepository.GetByIdAsync(id);
        }

        public async Task<EventInfrastructure> CreateInfrastructureAsync(EventInfrastructure infrastructure, Resource resource)
        {
            resource.CreatedAt = DateTime.UtcNow;
            resource.UpdatedAt = DateTime.UtcNow;
            await _resourceRepository.AddAsync(resource);
            await _resourceRepository.SaveChangesAsync();

            infrastructure.Id = resource.Id;
            await _infrastructureRepository.AddAsync(infrastructure);
            await _infrastructureRepository.SaveChangesAsync();
            return infrastructure;
        }

        public async Task<EventInfrastructure?> UpdateInfrastructureAsync(int id, EventInfrastructure infrastructure)
        {
            var existingInfrastructure = await _infrastructureRepository.GetByIdAsync(id);
            if (existingInfrastructure == null)
            {
                return null;
            }

            existingInfrastructure.Size = infrastructure.Size;
            existingInfrastructure.Weight = infrastructure.Weight;
            existingInfrastructure.SetupTime = infrastructure.SetupTime;

            _infrastructureRepository.Update(existingInfrastructure);
            await _infrastructureRepository.SaveChangesAsync();
            return existingInfrastructure;
        }

        public async Task<bool> DeleteInfrastructureAsync(int id)
        {
            var infrastructure = await _infrastructureRepository.GetByIdAsync(id);
            if (infrastructure == null)
            {
                return false;
            }

            var resource = await _resourceRepository.GetByIdAsync(id);
            if (resource != null)
            {
                _resourceRepository.Delete(resource);
                await _resourceRepository.SaveChangesAsync();
            }

            _infrastructureRepository.Delete(infrastructure);
            await _infrastructureRepository.SaveChangesAsync();
            return true;
        }
    }
}