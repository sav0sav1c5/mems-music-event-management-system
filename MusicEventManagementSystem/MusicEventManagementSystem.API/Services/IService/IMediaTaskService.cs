using MusicEventManagementSystem.API.DTOs.MediaCampaign;

namespace MusicEventManagementSystem.API.Services.IService
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