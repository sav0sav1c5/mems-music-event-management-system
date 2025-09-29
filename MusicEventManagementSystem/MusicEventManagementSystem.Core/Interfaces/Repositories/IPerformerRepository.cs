using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.Core.Interfaces.Repositories
{
    public interface IPerformerRepository : IRepository<Performer>
    {
        Task<Performer?> GetByNameAsync(string name);
        Task<IEnumerable<Performer>> GetByGenreAsync(string genre);
    }
}