using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.API.Services.IService;

namespace MusicEventManagementSystem.API.Services
{
    public class MediaChannelService : IMediaChannelService
    {
        private readonly IMediaChannelRepository _channelRepository;

        public MediaChannelService(IMediaChannelRepository channelRepository)
        {
            _channelRepository = channelRepository;
        }

        public async Task<IEnumerable<MediaChannel>> GetAllChannelsAsync()
        {
            return await _channelRepository.GetAllAsync();
        }

        public async Task<MediaChannel?> GetChannelByIdAsync(int id)
        {
            return await _channelRepository.GetByIdAsync(id);
        }

        public async Task<MediaChannel> CreateChannelAsync(MediaChannel channel)
        {
            await _channelRepository.AddAsync(channel);
            await _channelRepository.SaveChangesAsync();
            return channel;
        }

        public async Task<MediaChannel?> UpdateChannelAsync(int id, MediaChannel channel)
        {
            var existingChannel = await _channelRepository.GetByIdAsync(id);
            if (existingChannel == null)
            {
                return null;
            }

            existingChannel.PlatformType = channel.PlatformType;
            existingChannel.APIKey = channel.APIKey;
            existingChannel.APIURL = channel.APIURL;
            existingChannel.APIVersion = channel.APIVersion;

            _channelRepository.Update(existingChannel);
            await _channelRepository.SaveChangesAsync();
            return existingChannel;
        }

        public async Task<bool> DeleteChannelAsync(int id)
        {
            var channel = await _channelRepository.GetByIdAsync(id);
            if (channel == null)
            {
                return false;
            }

            _channelRepository.Delete(channel);
            await _channelRepository.SaveChangesAsync();
            return true;
        }
    }
}