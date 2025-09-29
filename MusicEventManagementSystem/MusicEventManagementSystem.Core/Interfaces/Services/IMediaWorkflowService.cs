using MusicEventManagementSystem.Core.Models.Entities.MediaCampaign;

namespace MusicEventManagementSystem.Core.Interfaces.Services
{
    public interface IMediaWorkflowService
    {
        Task<IEnumerable<MediaWorkflowResponseDto>> GetAllMediaWorkflowsAsync();
        Task<MediaWorkflowResponseDto?> GetMediaWorkflowByIdAsync(int id);
        Task<MediaWorkflowResponseDto> CreateMediaWorkflowAsync(MediaWorkflowCreateDto createDto);
        Task<MediaWorkflowResponseDto?> UpdateMediaWorkflowAsync(int id, MediaWorkflowUpdateDto updateDto);
        Task<bool> DeleteMediaWorkflowAsync(int id);
    }
}