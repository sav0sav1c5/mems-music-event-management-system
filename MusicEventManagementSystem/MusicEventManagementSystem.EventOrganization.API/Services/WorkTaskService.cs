<<<<<<< HEAD:MusicEventManagementSystem/MusicEventManagementSystem.API/Services/WorkTaskService.cs
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.API.Services.IService;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
=======
using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;
>>>>>>> fc7d1e8729b7d2d6668f9b466d7f35e20a9a6543:MusicEventManagementSystem/MusicEventManagementSystem.EventOrganization.API/Services/WorkTaskService.cs

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

        public async Task<IEnumerable<WorkTask>> GetWorkTasksByPerformanceIdAsync(int performanceId)
        {
            return await _workTaskRepository.GetByPerformanceIdAsync(performanceId);
        }

        public async Task<WorkTask> CreateWorkTaskAsync(WorkTask workTask)
        {
            workTask.CreatedAt = DateTime.UtcNow;
            workTask.UpdatedAt = DateTime.UtcNow;
            await _workTaskRepository.AddAsync(workTask);
            await _workTaskRepository.SaveChangesAsync();
            var created = await _workTaskRepository.GetByIdAsync(workTask.Id);
            if (created == null)
            {
                throw new InvalidOperationException("Failed to load created work task");
            }
            return created;
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
            return await _workTaskRepository.GetByIdAsync(existingWorkTask.Id);
        }

        public async Task<bool> DeleteWorkTaskAsync(int id)
        {
            var workTask = await _workTaskRepository.GetByIdAsync(id);
            if (workTask == null)
            {
                return false;
            }

            workTask.DeletedAt = DateTime.UtcNow;
            _workTaskRepository.Update(workTask);
            await _workTaskRepository.SaveChangesAsync();
            return true;
        }
    }
}
