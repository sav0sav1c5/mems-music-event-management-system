using MusicEventManagementSystem.API.DTOs.MediaCampaign;

namespace MusicEventManagementSystem.API.Services.IService
{
    public interface IMediaVersionService
    {
        Task<IEnumerable<MediaVersionResponseDto>> GetAllMediaVersionsAsync();
        Task<MediaVersionResponseDto?> GetMediaVersionByIdAsync(int id);
        Task<MediaVersionResponseDto> CreateMediaVersionAsync(MediaVersionCreateDto createDto);
        Task<MediaVersionResponseDto?> UpdateMediaVersionAsync(int id, MediaVersionUpdateDto updateDto);
        Task<bool> DeleteMediaVersionAsync(int id);
    }
}