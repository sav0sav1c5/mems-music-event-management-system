using MusicEventManagementSystem.Core.Models.Entities;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.Core.Interfaces.Repositories
{
    public interface IEquipmentRepository : IRepository<Equipment>
    {
        Task<Equipment?> GetBySerialNumberAsync(string serialNumber);
        Task<IEnumerable<Equipment>> GetByModelAsync(string model);
    }
}