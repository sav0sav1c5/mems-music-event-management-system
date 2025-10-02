using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.EventOrganization.API.Controllers
{
    public class ServiceService : IServiceService
    {
        private readonly IServiceRepository _serviceRepository;
        private readonly IResourceRepository _resourceRepository;

        public ServiceService(IServiceRepository serviceRepository, IResourceRepository resourceRepository)
        {
            _serviceRepository = serviceRepository;
            _resourceRepository = resourceRepository;
        }

        public async Task<IEnumerable<Service>> GetAllServicesAsync()
        {
            return await _serviceRepository.GetAllAsync();
        }

        public async Task<Service?> GetServiceByIdAsync(int id)
        {
            return await _serviceRepository.GetByIdAsync(id);
        }

        public async Task<Service> CreateServiceAsync(Service service, Resource resource)
        {
            resource.CreatedAt = DateTime.UtcNow;
            resource.UpdatedAt = DateTime.UtcNow;
            await _resourceRepository.AddAsync(resource);
            await _resourceRepository.SaveChangesAsync();

            service.Id = resource.Id;
            await _serviceRepository.AddAsync(service);
            await _serviceRepository.SaveChangesAsync();
            return service;
        }

        public async Task<Service?> UpdateServiceAsync(int id, Service service)
        {
            var existingService = await _serviceRepository.GetByIdAsync(id);
            if (existingService == null)
            {
                return null;
            }

            existingService.Provider = service.Provider;
            existingService.Contact = service.Contact;
            existingService.ContractSigned = service.ContractSigned;
            existingService.ServiceDuration = service.ServiceDuration;

            _serviceRepository.Update(existingService);
            await _serviceRepository.SaveChangesAsync();
            return existingService;
        }

        public async Task<bool> DeleteServiceAsync(int id)
        {
            var service = await _serviceRepository.GetByIdAsync(id);
            if (service == null)
            {
                return false;
            }

            var resource = await _resourceRepository.GetByIdAsync(id);
            if (resource != null)
            {
                _resourceRepository.Delete(resource);
                await _resourceRepository.SaveChangesAsync();
            }

            _serviceRepository.Delete(service);
            await _serviceRepository.SaveChangesAsync();
            return true;
        }
    }
}