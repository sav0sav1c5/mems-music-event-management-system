using MusicEventManagementSystem.API.DTOs.MediaCampaign;
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.API.Services.IService;

namespace MusicEventManagementSystem.API.Services
{
    public class AdService : IAdService
    {
        private readonly IAdRepository _adRepository;

        public AdService(IAdRepository adRepository)
        {
            _adRepository = adRepository;
        }

        public async Task<IEnumerable<AdResponseDto>> GetAllAdsAsync()
        {
            var ads = await _adRepository.GetAllAsync();
            return ads.Select(MapToResponseDto);
        }

        public async Task<AdResponseDto?> GetAdByIdAsync(int id)
        {
            var ad = await _adRepository.GetByIdAsync(id);
            return ad == null ? null : MapToResponseDto(ad);
        }

        public async Task<AdResponseDto> CreateAdAsync(AdCreateDto dto)
        {
            var ad = MapToEntity(dto);
            await _adRepository.AddAsync(ad);
            await _adRepository.SaveChangesAsync();
            return MapToResponseDto(ad);
        }

        public async Task<AdResponseDto?> UpdateAdAsync(int id, AdUpdateDto dto)
        {
            var ad = await _adRepository.GetByIdAsync(id);
            if (ad == null) return null;

            if (dto.Deadline.HasValue) ad.Deadline = dto.Deadline.Value;
            if (dto.Title != null) ad.Title = dto.Title;
            if (dto.CreationDate.HasValue) ad.CreationDate = dto.CreationDate.Value;
            if (dto.CurrentPhase.HasValue) ad.CurrentPhase = dto.CurrentPhase.Value;
            if (dto.PublicationDate.HasValue) ad.PublicationDate = dto.PublicationDate.Value;
            if (dto.MediaWorkflowId.HasValue) ad.MediaWorkflowId = dto.MediaWorkflowId.Value;
            if (dto.CampaignId.HasValue) ad.CampaignId = dto.CampaignId.Value;
            if (dto.AdTypeId.HasValue) ad.AdTypeId = dto.AdTypeId.Value;

            _adRepository.Update(ad);
            await _adRepository.SaveChangesAsync();
            return MapToResponseDto(ad);
        }

        public async Task<bool> DeleteAdAsync(int id)
        {
            var ad = await _adRepository.GetByIdAsync(id);
            if (ad == null) return false;
            _adRepository.Delete(ad);
            await _adRepository.SaveChangesAsync();
            return true;
        }

        private static AdResponseDto MapToResponseDto(Ad ad) => new()
        {
            AdId = ad.AdId,
            Deadline = ad.Deadline,
            Title = ad.Title,
            CreationDate = ad.CreationDate,
            CurrentPhase = ad.CurrentPhase,
            PublicationDate = ad.PublicationDate,
            MediaWorkflowId = ad.MediaWorkflowId,
            CampaignId = ad.CampaignId,
            AdTypeId = ad.AdTypeId
        };

        private static Ad MapToEntity(AdCreateDto dto) => new()
        {
            Deadline = dto.Deadline,
            Title = dto.Title,
            CreationDate = dto.CreationDate,
            CurrentPhase = dto.CurrentPhase,
            PublicationDate = dto.PublicationDate,
            MediaWorkflowId = dto.MediaWorkflowId,
            CampaignId = dto.CampaignId,
            AdTypeId = dto.AdTypeId
        };
    }
}