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

        public async Task<IEnumerable<MediaVersion>> GetAllVersionsAsync()
        {
            return await _mediaVersionRepository.GetAllAsync();
        }

        public async Task<MediaVersion?> GetVersionByIdAsync(int id)
        {
            return await _mediaVersionRepository.GetByIdAsync(id);
        }

        public async Task<MediaVersion> CreateVersionAsync(MediaVersion mediaVersion)
        {
            await _mediaVersionRepository.AddAsync(mediaVersion);
            await _mediaVersionRepository.SaveChangesAsync();
            return mediaVersion;
        }

        public async Task<MediaVersion?> UpdateVersionAsync(int id, MediaVersion mediaVersion)
        {
            var existingVersion = await _mediaVersionRepository.GetByIdAsync(id);
            if (existingVersion == null)
            {
                return null;
            }

            existingVersion.VersionFileName = mediaVersion.VersionFileName;
            existingVersion.FileType = mediaVersion.FileType;
            existingVersion.FileURL = mediaVersion.FileURL;
            existingVersion.IsFinalVersion = mediaVersion.IsFinalVersion;
            existingVersion.AdId = mediaVersion.AdId;

            _mediaVersionRepository.Update(existingVersion);
            await _mediaVersionRepository.SaveChangesAsync();
            return existingVersion;
        }

        public async Task<bool> DeleteVersionAsync(int id)
        {
            var version = await _mediaVersionRepository.GetByIdAsync(id);
            if (version == null)
            {
                return false;
            }

            _mediaVersionRepository.Delete(version);
            await _mediaVersionRepository.SaveChangesAsync();
            return true;
        }
    }
}