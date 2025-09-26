using MusicEventManagementSystem.API.DTOs.MediaCampaign;
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.API.Services.IService;

namespace MusicEventManagementSystem.API.Services
{
    public class MediaChannelService : IMediaChannelService
    {
        private readonly IMediaChannelRepository _mediaChannelRepository;

        public MediaChannelService(IMediaChannelRepository mediaChannelRepository)
        {
            _mediaChannelRepository = mediaChannelRepository;
        }

        public async Task<IEnumerable<MediaChannelResponseDto>> GetAllMediaChannelsAsync()
        {
            var channels = await _mediaChannelRepository.GetAllAsync();
            return channels.Select(MapToResponseDto);
        }

        public async Task<MediaChannelResponseDto?> GetMediaChannelByIdAsync(int id)
        {
            var channel = await _mediaChannelRepository.GetByIdAsync(id);
            return channel == null ? null : MapToResponseDto(channel);
        }

        public async Task<MediaChannelResponseDto> CreateMediaChannelAsync(MediaChannelCreateDto dto)
        {
            var channel = MapToEntity(dto);
            await _mediaChannelRepository.AddAsync(channel);
            await _mediaChannelRepository.SaveChangesAsync();
            return MapToResponseDto(channel);
        }

        public async Task<MediaChannelResponseDto?> UpdateMediaChannelAsync(int id, MediaChannelUpdateDto dto)
        {
            var channel = await _mediaChannelRepository.GetByIdAsync(id);
            if (channel == null) return null;

            if (dto.PlatformType != null) channel.PlatformType = dto.PlatformType;
            if (dto.APIKey != null) channel.APIKey = dto.APIKey;
            if (dto.APIURL != null) channel.APIURL = dto.APIURL;
            if (dto.APIVersion != null) channel.APIVersion = dto.APIVersion;

            _mediaChannelRepository.Update(channel);
            await _mediaChannelRepository.SaveChangesAsync();
            return MapToResponseDto(channel);
        }

        public async Task<bool> DeleteMediaChannelAsync(int id)
        {
            var channel = await _mediaChannelRepository.GetByIdAsync(id);
            if (channel == null) return false;
            _mediaChannelRepository.Delete(channel);
            await _mediaChannelRepository.SaveChangesAsync();
            return true;
        }

        private static MediaChannelResponseDto MapToResponseDto(MediaChannel channel) => new()
        {
            MediaChannelId = channel.MediaChannelId,
            PlatformType = channel.PlatformType,
            APIKey = channel.APIKey,
            APIURL = channel.APIURL,
            APIVersion = channel.APIVersion
        };

        private static MediaChannel MapToEntity(MediaChannelCreateDto dto) => new()
        {
            PlatformType = dto.PlatformType,
            APIKey = dto.APIKey,
            APIURL = dto.APIURL,
            APIVersion = dto.APIVersion
        };
    }
}