using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;
using MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication;

namespace MusicEventManagementSystem.Core.Interfaces.Services
{
    public interface IPerformerService
    {
        Task<IEnumerable<Performer>> GetAllPerformersAsync();
        Task<Performer?> GetPerformerByIdAsync(int id);
        Task<Performer> CreatePerformerAsync(PerformerDto performerDto);
        Task<Performer?> UpdatePerformerAsync(int id, PerformerDto performerDto);
        Task<bool> DeletePerformerAsync(int id);
    }
}
