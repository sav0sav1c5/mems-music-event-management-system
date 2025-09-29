using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.EventOrganization.API.Controllers
{
    public class ResourceService : IResourceService
    {
        private readonly IResourceRepository _resourceRepository;

        public ResourceService(IResourceRepository resourceRepository)
        {
            _resourceRepository = resourceRepository;
        }

        public async Task<IEnumerable<Resource>> GetAllResourcesAsync()
        {
            return await _resourceRepository.GetAllAsync();
        }

        public async Task<Resource?> GetResourceByIdAsync(int id)
        {
            return await _resourceRepository.GetByIdAsync(id);
        }

        public async Task<Resource> CreateResourceAsync(Resource resource)
        {
            resource.CreatedAt = DateTime.UtcNow;
            resource.UpdatedAt = DateTime.UtcNow;
            await _resourceRepository.AddAsync(resource);
            await _resourceRepository.SaveChangesAsync();
            return resource;
        }

        public async Task<Resource?> UpdateResourceAsync(int id, Resource resource)
        {
            var existingResource = await _resourceRepository.GetByIdAsync(id);
            if (existingResource == null)
            {
                return null;
            }

            existingResource.Name = resource.Name;
            existingResource.Type = resource.Type;
            existingResource.Description = resource.Description;
            existingResource.Quantity = resource.Quantity;
            existingResource.IsAvailable = resource.IsAvailable;
            existingResource.UpdatedAt = DateTime.UtcNow;

            _resourceRepository.Update(existingResource);
            await _resourceRepository.SaveChangesAsync();
            return existingResource;
        }

        public async Task<bool> DeleteResourceAsync(int id)
        {
            var resource = await _resourceRepository.GetByIdAsync(id);
            if (resource == null)
            {
                return false;
            }

            _resourceRepository.Delete(resource);
            await _resourceRepository.SaveChangesAsync();
            return true;
        }
    }
}