using MusicEventManagementSystem.API.Models;

namespace MusicEventManagementSystem.API.Services.IService
{
    public interface IMediaWorkflowService
    {
        Task<IEnumerable<MediaWorkflow>> GetAllWorkflowsAsync();
        Task<MediaWorkflow?> GetWorkflowByIdAsync(int id);
        Task<MediaWorkflow> CreateWorkflowAsync(MediaWorkflow workflow);
        Task<MediaWorkflow?> UpdateWorkflowAsync(int id, MediaWorkflow workflow);
        Task<bool> DeleteWorkflowAsync(int id);
    }
}