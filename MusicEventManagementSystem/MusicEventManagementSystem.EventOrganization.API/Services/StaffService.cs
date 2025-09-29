using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.EventOrganization.API.Controllers
{
    public class StaffService : IStaffService
    {
        private readonly IStaffRepository _staffRepository;
        private readonly IResourceRepository _resourceRepository;

        public StaffService(IStaffRepository staffRepository, IResourceRepository resourceRepository)
        {
            _staffRepository = staffRepository;
            _resourceRepository = resourceRepository;
        }

        public async Task<IEnumerable<Staff>> GetAllStaffAsync()
        {
            return await _staffRepository.GetAllAsync();
        }

        public async Task<Staff?> GetStaffByIdAsync(int id)
        {
            return await _staffRepository.GetByIdAsync(id);
        }

        public async Task<Staff> CreateStaffAsync(Staff staff, Resource resource)
        {
            resource.CreatedAt = DateTime.UtcNow;
            resource.UpdatedAt = DateTime.UtcNow;
            await _resourceRepository.AddAsync(resource);
            await _resourceRepository.SaveChangesAsync();

            staff.Id = resource.Id;
            await _staffRepository.AddAsync(staff);
            await _staffRepository.SaveChangesAsync();
            return staff;
        }

        public async Task<Staff?> UpdateStaffAsync(int id, Staff staff)
        {
            var existingStaff = await _staffRepository.GetByIdAsync(id);
            if (existingStaff == null)
            {
                return null;
            }

            existingStaff.Role = staff.Role;
            existingStaff.RequiredSkillLevel = staff.RequiredSkillLevel;

            _staffRepository.Update(existingStaff);
            await _staffRepository.SaveChangesAsync();
            return existingStaff;
        }

        public async Task<bool> DeleteStaffAsync(int id)
        {
            var staff = await _staffRepository.GetByIdAsync(id);
            if (staff == null)
            {
                return false;
            }

            var resource = await _resourceRepository.GetByIdAsync(id);
            if (resource != null)
            {
                _resourceRepository.Delete(resource);
                await _resourceRepository.SaveChangesAsync();
            }

            _staffRepository.Delete(staff);
            await _staffRepository.SaveChangesAsync();
            return true;
        }
    }
}