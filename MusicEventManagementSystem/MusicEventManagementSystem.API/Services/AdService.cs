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

        public async Task<IEnumerable<Ad>> GetAllAdsAsync()
        {
            return await _adRepository.GetAllAsync();
        }

        public async Task<Ad?> GetAdByIdAsync(int id)
        {
            return await _adRepository.GetByIdAsync(id);
        }

        public async Task<Ad> CreateAdAsync(Ad ad)
        {
            await _adRepository.AddAsync(ad);
            await _adRepository.SaveChangesAsync();
            return ad;
        }

        public async Task<Ad?> UpdateAdAsync(int id, Ad ad)
        {
            var existingAd = await _adRepository.GetByIdAsync(id);
            if (existingAd == null)
            {
                return null;
            }

            existingAd.Deadline = ad.Deadline;
            existingAd.Title = ad.Title;
            existingAd.CurrentPhase = ad.CurrentPhase;
            existingAd.PublicationDate = ad.PublicationDate;
            existingAd.MediaWorkflowId = ad.MediaWorkflowId;
            existingAd.CampaignId = ad.CampaignId;
            existingAd.AdTypeId = ad.AdTypeId;

            _adRepository.Update(existingAd);
            await _adRepository.SaveChangesAsync();
            return existingAd;
        }

        public async Task<bool> DeleteAdAsync(int id)
        {
            var ad = await _adRepository.GetByIdAsync(id);
            if (ad == null)
            {
                return false;
            }

            _adRepository.Delete(ad);
            await _adRepository.SaveChangesAsync();
            return true;
        }
    }
}