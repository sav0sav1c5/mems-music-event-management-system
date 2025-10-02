using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.EventOrganization.API.Controllers
{
    public class VehicleService : IVehicleService
    {
        private readonly IVehicleRepository _vehicleRepository;
        private readonly IResourceRepository _resourceRepository;

        public VehicleService(IVehicleRepository vehicleRepository, IResourceRepository resourceRepository)
        {
            _vehicleRepository = vehicleRepository;
            _resourceRepository = resourceRepository;
        }

        public async Task<IEnumerable<Vehicle>> GetAllVehiclesAsync()
        {
            return await _vehicleRepository.GetAllAsync();
        }

        public async Task<Vehicle?> GetVehicleByIdAsync(int id)
        {
            return await _vehicleRepository.GetByIdAsync(id);
        }

        public async Task<Vehicle> CreateVehicleAsync(Vehicle vehicle, Resource resource)
        {
            resource.CreatedAt = DateTime.UtcNow;
            resource.UpdatedAt = DateTime.UtcNow;
            await _resourceRepository.AddAsync(resource);
            await _resourceRepository.SaveChangesAsync();

            vehicle.Id = resource.Id;
            await _vehicleRepository.AddAsync(vehicle);
            await _vehicleRepository.SaveChangesAsync();
            return vehicle;
        }

        public async Task<Vehicle?> UpdateVehicleAsync(int id, Vehicle vehicle)
        {
            var existingVehicle = await _vehicleRepository.GetByIdAsync(id);
            if (existingVehicle == null)
            {
                return null;
            }

            existingVehicle.VehicleType = vehicle.VehicleType;
            existingVehicle.LicensePlate = vehicle.LicensePlate;
            existingVehicle.Capacity = vehicle.Capacity;
            existingVehicle.DriverRequired = vehicle.DriverRequired;
            existingVehicle.FuelType = vehicle.FuelType;

            _vehicleRepository.Update(existingVehicle);
            await _vehicleRepository.SaveChangesAsync();
            return existingVehicle;
        }

        public async Task<bool> DeleteVehicleAsync(int id)
        {
            var vehicle = await _vehicleRepository.GetByIdAsync(id);
            if (vehicle == null)
            {
                return false;
            }

            var resource = await _resourceRepository.GetByIdAsync(id);
            if (resource != null)
            {
                _resourceRepository.Delete(resource);
                await _resourceRepository.SaveChangesAsync();
            }

            _vehicleRepository.Delete(vehicle);
            await _vehicleRepository.SaveChangesAsync();
            return true;
        }
    }
}