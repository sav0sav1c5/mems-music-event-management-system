using Microsoft.EntityFrameworkCore;
using MusicEventManagementSystem.Core.Enums.EventOrganization;
using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;
using MusicEventManagementSystem.Infrastructure.Database;

namespace MusicEventManagementSystem.Infrastructure.Repositories
{
    public class VehicleRepository : Repository<Vehicle>, IVehicleRepository
    {
        public VehicleRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<Vehicle?> GetByLicensePlateAsync(string licensePlate)
        {
            return await _dbSet.FirstOrDefaultAsync(v => v.LicensePlate == licensePlate);
        }

        public async Task<IEnumerable<Vehicle>> GetByTypeAsync(VehicleType type)
        {
            return await _dbSet.Where(v => v.VehicleType == type).ToListAsync();
        }
    }
}