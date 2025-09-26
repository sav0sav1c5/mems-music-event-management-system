using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.API.Services.IService;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MusicEventManagementSystem.API.Services
{
    public class MediaWorkflowService : IMediaWorkflowService
    {
        private readonly IMediaWorkflowRepository _mediaWorkflowRepository;

        public MediaWorkflowService(IMediaWorkflowRepository mediaWorkflowRepository)
        {
            _mediaWorkflowRepository = mediaWorkflowRepository;
        }

        public async Task<IEnumerable<MediaWorkflow>> GetAllWorkflowsAsync()
        {
            return await _mediaWorkflowRepository.GetAllAsync();
        }

        public async Task<MediaWorkflow?> GetWorkflowByIdAsync(int id)
        {
            return await _mediaWorkflowRepository.GetByIdAsync(id);
        }

        public async Task<MediaWorkflow> CreateWorkflowAsync(MediaWorkflow workflow)
        {
            await _mediaWorkflowRepository.AddAsync(workflow);
            await _mediaWorkflowRepository.SaveChangesAsync();
            return workflow;
        }

        public async Task<MediaWorkflow?> UpdateWorkflowAsync(int id, MediaWorkflow workflow)
        {
            var existingWorkflow = await _mediaWorkflowRepository.GetByIdAsync(id);
            if (existingWorkflow == null)
            {
                return null;
            }

            existingWorkflow.WorkflowDescription = workflow.WorkflowDescription;

            _mediaWorkflowRepository.Update(existingWorkflow);
            await _mediaWorkflowRepository.SaveChangesAsync();
            return existingWorkflow;
        }

        public async Task<bool> DeleteWorkflowAsync(int id)
        {
            var workflow = await _mediaWorkflowRepository.GetByIdAsync(id);
            if (workflow == null)
            {
                return false;
            }

            _mediaWorkflowRepository.Delete(workflow);
            await _mediaWorkflowRepository.SaveChangesAsync();
            return true;
        }
    }
}