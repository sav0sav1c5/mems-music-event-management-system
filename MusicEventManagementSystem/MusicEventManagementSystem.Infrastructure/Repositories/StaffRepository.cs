using Microsoft.EntityFrameworkCore;
using MusicEventManagementSystem.Core.Enums.EventOrganization;
using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;
using MusicEventManagementSystem.Infrastructure.Database;

namespace MusicEventManagementSystem.Infrastructure.Repositories
{
    public class StaffRepository : Repository<Staff>, IStaffRepository
    {
        public StaffRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Staff>> GetByRoleAsync(StaffRole role)
        {
            return await _dbSet.Where(s => s.Role == role).ToListAsync();
        }

        public async Task<IEnumerable<Staff>> GetBySkillLevelAsync(RequiredSkillLevel skillLevel)
        {
            return await _dbSet.Where(s => s.RequiredSkillLevel == skillLevel).ToListAsync();
        }
    }
}