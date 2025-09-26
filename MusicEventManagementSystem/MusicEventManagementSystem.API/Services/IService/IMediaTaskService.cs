using MusicEventManagementSystem.API.Models;
namespace MusicEventManagementSystem.API.Services.IService
{
        public interface IMediaTaskService
        {
            Task<IEnumerable<MediaTask>> GetAllTasksAsync();
            Task<MediaTask?> GetTaskByIdAsync(int id);
            Task<MediaTask> CreateTaskAsync(MediaTask task);
            Task<MediaTask?> UpdateTaskAsync(int id, MediaTask task);
            Task<bool> DeleteTaskAsync(int id);
        }
    }
