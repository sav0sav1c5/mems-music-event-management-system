using MusicEventManagementSystem.API.DTOs.MediaCampaign;
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.API.Services.IService;

namespace MusicEventManagementSystem.API.Services
{
    public class AdTypeService : IAdTypeService
    {
        private readonly IAdTypeRepository _adTypeRepository;

        public AdTypeService(IAdTypeRepository adTypeRepository)
        {
            _adTypeRepository = adTypeRepository;
        }

        public async Task<IEnumerable<AdTypeResponseDto>> GetAllAdTypesAsync()
        {
            var adTypes = await _adTypeRepository.GetAllAsync();
            return adTypes.Select(MapToResponseDto);
        }

        public async Task<AdTypeResponseDto?> GetAdTypeByIdAsync(int id)
        {
            var adType = await _adTypeRepository.GetByIdAsync(id);
            if (adType == null)
                return null;
            return MapToResponseDto(adType);
        }

        public async Task<AdTypeResponseDto> CreateAdTypeAsync(AdTypeCreateDto dto)
        {
            var adType = MapToEntity(dto);

            await _adTypeRepository.AddAsync(adType);
            await _adTypeRepository.SaveChangesAsync();

            return MapToResponseDto(adType);
        }

        public async Task<AdTypeResponseDto?> UpdateAdTypeAsync(int id, AdTypeUpdateDto dto)
        {
            var existingAdType = await _adTypeRepository.GetByIdAsync(id);

            if (existingAdType == null)
                return null;

            if (dto.TypeName != null)
                existingAdType.TypeName = dto.TypeName;
            if (dto.TypeDescription != null)
                existingAdType.TypeDescription = dto.TypeDescription;
            if (dto.Dimensions != null)
                existingAdType.Dimensions = dto.Dimensions;
            if (dto.Duration.HasValue)
                existingAdType.Duration = dto.Duration.Value;
            if (dto.FileFormat != null)
                existingAdType.FileFormat = dto.FileFormat;

            _adTypeRepository.Update(existingAdType);
            await _adTypeRepository.SaveChangesAsync();
            return MapToResponseDto(existingAdType);
        }

        public async Task<bool> DeleteAdTypeAsync(int id)
        {
            var adType = await _adTypeRepository.GetByIdAsync(id);
            if (adType == null)
                return false;

            _adTypeRepository.Delete(adType);
            await _adTypeRepository.SaveChangesAsync();
            return true;
        }

        // Helper methods
        private static AdTypeResponseDto MapToResponseDto(AdType adType)
        {
            return new AdTypeResponseDto
            {
                AdTypeId = adType.AdTypeId,
                TypeName = adType.TypeName,
                TypeDescription = adType.TypeDescription,
                Dimensions = adType.Dimensions,
                Duration = adType.Duration,
                FileFormat = adType.FileFormat
            };
        }

        private static AdType MapToEntity(AdTypeCreateDto dto)
        {
            return new AdType
            {
                TypeName = dto.TypeName,
                TypeDescription = dto.TypeDescription,
                Dimensions = dto.Dimensions,
                Duration = dto.Duration,
                FileFormat = dto.FileFormat
            };
        }
    }
}