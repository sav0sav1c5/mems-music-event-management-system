using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.API.Services.IService;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MusicEventManagementSystem.API.Services
{
    public class MediaTaskService : IMediaTaskService
    {
        private readonly IMediaTaskRepository _mediaTaskRepository;

        public MediaTaskService(IMediaTaskRepository mediaTaskRepository)
        {
            _mediaTaskRepository = mediaTaskRepository;
        }

        public async Task<IEnumerable<MediaTask>> GetAllTasksAsync()
        {
            return await _mediaTaskRepository.GetAllAsync();
        }

        public async Task<MediaTask?> GetTaskByIdAsync(int id)
        {
            return await _mediaTaskRepository.GetByIdAsync(id);
        }

        public async Task<MediaTask> CreateTaskAsync(MediaTask task)
        {
            await _mediaTaskRepository.AddAsync(task);
            await _mediaTaskRepository.SaveChangesAsync();
            return task;
        }

        public async Task<MediaTask?> UpdateTaskAsync(int id, MediaTask task)
        {
            var existingTask = await _mediaTaskRepository.GetByIdAsync(id);
            if (existingTask == null)
            {
                return null;
            }

            existingTask.TaskName = task.TaskName;
            existingTask.Order = task.Order;
            existingTask.TaskStatus = task.TaskStatus;
            existingTask.WorkflowId = task.WorkflowId;

            _mediaTaskRepository.Update(existingTask);
            await _mediaTaskRepository.SaveChangesAsync();
            return existingTask;
        }

        public async Task<bool> DeleteTaskAsync(int id)
        {
            var task = await _mediaTaskRepository.GetByIdAsync(id);
            if (task == null)
            {
                return false;
            }

            _mediaTaskRepository.Delete(task);
            await _mediaTaskRepository.SaveChangesAsync();
            return true;
        }
    }
}