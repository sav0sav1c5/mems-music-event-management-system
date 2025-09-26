using MusicEventManagementSystem.API.DTOs.MediaCampaign;
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.API.Services.IService;

namespace MusicEventManagementSystem.API.Services
{
    public class MediaVersionService : IMediaVersionService
    {
        private readonly IMediaVersionRepository _mediaVersionRepository;

        public MediaVersionService(IMediaVersionRepository mediaVersionRepository)
        {
            _mediaVersionRepository = mediaVersionRepository;
        }

        public async Task<IEnumerable<MediaVersionResponseDto>> GetAllMediaVersionsAsync()
        {
            var versions = await _mediaVersionRepository.GetAllAsync();
            return versions.Select(MapToResponseDto);
        }

        public async Task<MediaVersionResponseDto?> GetMediaVersionByIdAsync(int id)
        {
            var version = await _mediaVersionRepository.GetByIdAsync(id);
            return version == null ? null : MapToResponseDto(version);
        }

        public async Task<MediaVersionResponseDto> CreateMediaVersionAsync(MediaVersionCreateDto dto)
        {
            var version = MapToEntity(dto);
            await _mediaVersionRepository.AddAsync(version);
            await _mediaVersionRepository.SaveChangesAsync();
            return MapToResponseDto(version);
        }

        public async Task<MediaVersionResponseDto?> UpdateMediaVersionAsync(int id, MediaVersionUpdateDto dto)
        {
            var version = await _mediaVersionRepository.GetByIdAsync(id);
            if (version == null) return null;

            if (dto.VersionFileName != null) version.VersionFileName = dto.VersionFileName;
            if (dto.FileType != null) version.FileType = dto.FileType;
            if (dto.FileURL != null) version.FileURL = dto.FileURL;
            if (dto.IsFinalVersion.HasValue) version.IsFinalVersion = dto.IsFinalVersion.Value;
            if (dto.AdId.HasValue) version.AdId = dto.AdId.Value;

            _mediaVersionRepository.Update(version);
            await _mediaVersionRepository.SaveChangesAsync();
            return MapToResponseDto(version);
        }

        public async Task<bool> DeleteMediaVersionAsync(int id)
        {
            var version = await _mediaVersionRepository.GetByIdAsync(id);
            if (version == null) return false;
            _mediaVersionRepository.Delete(version);
            await _mediaVersionRepository.SaveChangesAsync();
            return true;
        }

        private static MediaVersionResponseDto MapToResponseDto(MediaVersion version) => new()
        {
            MediaVersionId = version.MediaVersionId,
            VersionFileName = version.VersionFileName,
            FileType = version.FileType,
            FileURL = version.FileURL,
            IsFinalVersion = version.IsFinalVersion,
            AdId = version.AdId
        };

        private static MediaVersion MapToEntity(MediaVersionCreateDto dto) => new()
        {
            VersionFileName = dto.VersionFileName,
            FileType = dto.FileType,
            FileURL = dto.FileURL,
            IsFinalVersion = dto.IsFinalVersion,
            AdId = dto.AdId
        };
    }
}