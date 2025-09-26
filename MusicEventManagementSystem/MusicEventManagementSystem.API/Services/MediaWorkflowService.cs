using MusicEventManagementSystem.API.DTOs.MediaCampaign;
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.API.Services.IService;

namespace MusicEventManagementSystem.API.Services
{
    public class MediaWorkflowService : IMediaWorkflowService
    {
        private readonly IMediaWorkflowRepository _mediaWorkflowRepository;

        public MediaWorkflowService(IMediaWorkflowRepository mediaWorkflowRepository)
        {
            _mediaWorkflowRepository = mediaWorkflowRepository;
        }

        public async Task<IEnumerable<MediaWorkflowResponseDto>> GetAllMediaWorkflowsAsync()
        {
            var workflows = await _mediaWorkflowRepository.GetAllAsync();
            return workflows.Select(MapToResponseDto);
        }

        public async Task<MediaWorkflowResponseDto?> GetMediaWorkflowByIdAsync(int id)
        {
            var workflow = await _mediaWorkflowRepository.GetByIdAsync(id);
            return workflow == null ? null : MapToResponseDto(workflow);
        }

        public async Task<MediaWorkflowResponseDto> CreateMediaWorkflowAsync(MediaWorkflowCreateDto dto)
        {
            var workflow = MapToEntity(dto);
            await _mediaWorkflowRepository.AddAsync(workflow);
            await _mediaWorkflowRepository.SaveChangesAsync();
            return MapToResponseDto(workflow);
        }

        public async Task<MediaWorkflowResponseDto?> UpdateMediaWorkflowAsync(int id, MediaWorkflowUpdateDto dto)
        {
            var workflow = await _mediaWorkflowRepository.GetByIdAsync(id);
            if (workflow == null) return null;

            if (dto.WorkflowDescription != null) workflow.WorkflowDescription = dto.WorkflowDescription;

            _mediaWorkflowRepository.Update(workflow);
            await _mediaWorkflowRepository.SaveChangesAsync();
            return MapToResponseDto(workflow);
        }

        public async Task<bool> DeleteMediaWorkflowAsync(int id)
        {
            var workflow = await _mediaWorkflowRepository.GetByIdAsync(id);
            if (workflow == null) return false;
            _mediaWorkflowRepository.Delete(workflow);
            await _mediaWorkflowRepository.SaveChangesAsync();
            return true;
        }

        private static MediaWorkflowResponseDto MapToResponseDto(MediaWorkflow workflow) => new()
        {
            MediaWorkflowId = workflow.MediaWorkflowId,
            WorkflowDescription = workflow.WorkflowDescription
        };

        private static MediaWorkflow MapToEntity(MediaWorkflowCreateDto dto) => new()
        {
            WorkflowDescription = dto.WorkflowDescription
        };
    }
}