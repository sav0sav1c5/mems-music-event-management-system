using MusicEventManagementSystem.Core.Enums.EventOrganization;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.Core.Interfaces.Repositories
{
    public interface IStaffRepository : IRepository<Staff>
    {
        Task<IEnumerable<Staff>> GetByRoleAsync(StaffRole role);
        Task<IEnumerable<Staff>> GetBySkillLevelAsync(RequiredSkillLevel skillLevel);
    }
}