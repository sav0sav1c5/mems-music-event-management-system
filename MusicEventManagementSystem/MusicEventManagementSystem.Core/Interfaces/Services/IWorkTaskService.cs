using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.Core.Interfaces.Services
{
    public interface IWorkTaskService
    {
        Task<IEnumerable<WorkTask>> GetAllWorkTasksAsync();
        Task<WorkTask?> GetWorkTaskByIdAsync(int id);
        Task<WorkTask> CreateWorkTaskAsync(WorkTask workTask);
        Task<WorkTask?> UpdateWorkTaskAsync(int id, WorkTask workTask);
        Task<bool> DeleteWorkTaskAsync(int id);
    }
}