using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.EventOrganization.API.Controllers
{
    public class WorkTaskService : IWorkTaskService
    {
        private readonly IWorkTaskRepository _workTaskRepository;

        public WorkTaskService(IWorkTaskRepository workTaskRepository)
        {
            _workTaskRepository = workTaskRepository;
        }

        public async Task<IEnumerable<WorkTask>> GetAllWorkTasksAsync()
        {
            return await _workTaskRepository.GetAllAsync();
        }

        public async Task<WorkTask?> GetWorkTaskByIdAsync(int id)
        {
            return await _workTaskRepository.GetByIdAsync(id);
        }

        public async Task<WorkTask> CreateWorkTaskAsync(WorkTask workTask)
        {
            workTask.CreatedAt = DateTime.UtcNow;
            workTask.UpdatedAt = DateTime.UtcNow;
            await _workTaskRepository.AddAsync(workTask);
            await _workTaskRepository.SaveChangesAsync();
            return workTask;
        }

        public async Task<WorkTask?> UpdateWorkTaskAsync(int id, WorkTask workTask)
        {
            var existingWorkTask = await _workTaskRepository.GetByIdAsync(id);
            if (existingWorkTask == null)
            {
                return null;
            }

            existingWorkTask.PerformanceId = workTask.PerformanceId;
            existingWorkTask.Name = workTask.Name;
            existingWorkTask.Description = workTask.Description;
            existingWorkTask.Status = workTask.Status;
            existingWorkTask.Start = workTask.Start;
            existingWorkTask.End = workTask.End;
            existingWorkTask.UpdatedAt = DateTime.UtcNow;

            _workTaskRepository.Update(existingWorkTask);
            await _workTaskRepository.SaveChangesAsync();
            return existingWorkTask;
        }

        public async Task<bool> DeleteWorkTaskAsync(int id)
        {
            var workTask = await _workTaskRepository.GetByIdAsync(id);
            if (workTask == null)
            {
                return false;
            }

            _workTaskRepository.Delete(workTask);
            await _workTaskRepository.SaveChangesAsync();
            return true;
        }
    }
}