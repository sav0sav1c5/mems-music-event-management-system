using MusicEventManagementSystem.API.Models;

namespace MusicEventManagementSystem.API.Services.IService
{
    public interface IWorkTaskService
    {
        Task<IEnumerable<WorkTask>> GetAllWorkTasksAsync();
        Task<WorkTask?> GetWorkTaskByIdAsync(int id);
        Task<IEnumerable<WorkTask>> GetWorkTasksByPerformanceIdAsync(int performanceId);
        Task<WorkTask> CreateWorkTaskAsync(WorkTask workTask);
        Task<WorkTask?> UpdateWorkTaskAsync(int id, WorkTask workTask);
        Task<bool> DeleteWorkTaskAsync(int id);
    }
}
