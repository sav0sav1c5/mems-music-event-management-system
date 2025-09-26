using MusicEventManagementSystem.API.DTOs.MediaCampaign;

namespace MusicEventManagementSystem.API.Services.IService
{
    public interface IMediaChannelService
    {
        Task<IEnumerable<MediaChannelResponseDto>> GetAllMediaChannelsAsync();
        Task<MediaChannelResponseDto?> GetMediaChannelByIdAsync(int id);
        Task<MediaChannelResponseDto> CreateMediaChannelAsync(MediaChannelCreateDto createDto);
        Task<MediaChannelResponseDto?> UpdateMediaChannelAsync(int id, MediaChannelUpdateDto updateDto);
        Task<bool> DeleteMediaChannelAsync(int id);
    }
}