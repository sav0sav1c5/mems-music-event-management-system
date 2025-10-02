using MusicEventManagementSystem.Core.Models.Entities.MediaCampaign;

namespace MusicEventManagementSystem.Core.Interfaces.Services
{
    public interface IMediaTaskService
    {
        Task<IEnumerable<MediaTaskResponseDto>> GetAllMediaTasksAsync();
        Task<MediaTaskResponseDto?> GetMediaTaskByIdAsync(int id);
        Task<MediaTaskResponseDto> CreateMediaTaskAsync(MediaTaskCreateDto createDto);
        Task<MediaTaskResponseDto?> UpdateMediaTaskAsync(int id, MediaTaskUpdateDto updateDto);
        Task<bool> DeleteMediaTaskAsync(int id);
    }
}