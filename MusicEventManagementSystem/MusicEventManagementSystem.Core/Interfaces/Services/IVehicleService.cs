using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.Core.Interfaces.Services
{
    public interface IVehicleService
    {
        Task<IEnumerable<Vehicle>> GetAllVehiclesAsync();
        Task<Vehicle?> GetVehicleByIdAsync(int id);
        Task<Vehicle> CreateVehicleAsync(Vehicle vehicle, Resource resource);
        Task<Vehicle?> UpdateVehicleAsync(int id, Vehicle vehicle);
        Task<bool> DeleteVehicleAsync(int id);
    }
}