using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.EventOrganization.API.Controllers
{
    public class LocationService : ILocationService
    {
        private readonly ILocationRepository _locationRepository;

        public LocationService(ILocationRepository locationRepository)
        {
            _locationRepository = locationRepository;
        }

        public async Task<IEnumerable<Location>> GetAllLocationsAsync()
        {
            return await _locationRepository.GetAllAsync();
        }

        public async Task<Location?> GetLocationByIdAsync(int id)
        {
            return await _locationRepository.GetByIdAsync(id);
        }

        public async Task<Location> CreateLocationAsync(Location location)
        {
            await _locationRepository.AddAsync(location);
            await _locationRepository.SaveChangesAsync();
            return location;
        }

        public async Task<Location?> UpdateLocationAsync(int id, Location location)
        {
            var existingLocation = await _locationRepository.GetByIdAsync(id);
            if (existingLocation == null)
            {
                return null;
            }

            existingLocation.Name = location.Name;

            _locationRepository.Update(existingLocation);
            await _locationRepository.SaveChangesAsync();
            return existingLocation;
        }

        public async Task<bool> DeleteLocationAsync(int id)
        {
            var location = await _locationRepository.GetByIdAsync(id);
            if (location == null)
            {
                return false;
            }

            _locationRepository.Delete(location);
            await _locationRepository.SaveChangesAsync();
            return true;
        }
    }
}