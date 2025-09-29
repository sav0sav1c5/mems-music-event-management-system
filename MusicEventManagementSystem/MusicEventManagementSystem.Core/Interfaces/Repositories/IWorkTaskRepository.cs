using MusicEventManagementSystem.Core.Enums.EventOrganization;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.Core.Interfaces.Repositories
{
    public interface IWorkTaskRepository : IRepository<WorkTask>
    {
        Task<IEnumerable<WorkTask>> GetByPerformanceIdAsync(int performanceId);
        Task<IEnumerable<WorkTask>> GetByStatusAsync(WorkTaskStatus status);
    }
}