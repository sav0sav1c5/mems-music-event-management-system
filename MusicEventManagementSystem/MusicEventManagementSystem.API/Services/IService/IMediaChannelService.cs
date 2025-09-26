using MusicEventManagementSystem.API.Models;

namespace MusicEventManagementSystem.API.Services.IService
{
    public interface IMediaChannelService
    {
        Task<IEnumerable<MediaChannel>> GetAllChannelsAsync();
        Task<MediaChannel?> GetChannelByIdAsync(int id);
        Task<MediaChannel> CreateChannelAsync(MediaChannel channel);
        Task<MediaChannel?> UpdateChannelAsync(int id, MediaChannel channel);
        Task<bool> DeleteChannelAsync(int id);
    }
}