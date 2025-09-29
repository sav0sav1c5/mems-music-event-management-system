using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.EventOrganization.API.Controllers
{
    public class EquipmentService : IEquipmentService
    {
        private readonly IEquipmentRepository _equipmentRepository;
        private readonly IResourceRepository _resourceRepository;

        public EquipmentService(IEquipmentRepository equipmentRepository, IResourceRepository resourceRepository)
        {
            _equipmentRepository = equipmentRepository;
            _resourceRepository = resourceRepository;
        }

        public async Task<IEnumerable<Equipment>> GetAllEquipmentAsync()
        {
            return await _equipmentRepository.GetAllAsync();
        }

        public async Task<Equipment?> GetEquipmentByIdAsync(int id)
        {
            return await _equipmentRepository.GetByIdAsync(id);
        }

        public async Task<Equipment> CreateEquipmentAsync(Equipment equipment, Resource resource)
        {
            resource.CreatedAt = DateTime.UtcNow;
            resource.UpdatedAt = DateTime.UtcNow;
            await _resourceRepository.AddAsync(resource);
            await _resourceRepository.SaveChangesAsync();

            equipment.Id = resource.Id;
            await _equipmentRepository.AddAsync(equipment);
            await _equipmentRepository.SaveChangesAsync();
            return equipment;
        }

        public async Task<Equipment?> UpdateEquipmentAsync(int id, Equipment equipment)
        {
            var existingEquipment = await _equipmentRepository.GetByIdAsync(id);
            if (existingEquipment == null)
            {
                return null;
            }

            existingEquipment.Model = equipment.Model;
            existingEquipment.SerialNumber = equipment.SerialNumber;
            existingEquipment.RequiresSetup = equipment.RequiresSetup;
            existingEquipment.PowerRequirements = equipment.PowerRequirements;

            _equipmentRepository.Update(existingEquipment);
            await _equipmentRepository.SaveChangesAsync();
            return existingEquipment;
        }

        public async Task<bool> DeleteEquipmentAsync(int id)
        {
            var equipment = await _equipmentRepository.GetByIdAsync(id);
            if (equipment == null)
            {
                return false;
            }

            var resource = await _resourceRepository.GetByIdAsync(id);
            if (resource != null)
            {
                _resourceRepository.Delete(resource);
                await _resourceRepository.SaveChangesAsync();
            }

            _equipmentRepository.Delete(equipment);
            await _equipmentRepository.SaveChangesAsync();
            return true;
        }
    }
}