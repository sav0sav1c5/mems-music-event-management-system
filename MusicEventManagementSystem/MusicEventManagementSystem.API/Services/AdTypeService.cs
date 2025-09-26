using MusicEventManagementSystem.API.Models;
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

        public async Task<IEnumerable<AdType>> GetAllAdTypesAsync()
        {
            return await _adTypeRepository.GetAllAsync();
        }

        public async Task<AdType?> GetAdTypeByIdAsync(int id)
        {
            return await _adTypeRepository.GetByIdAsync(id);
        }

        public async Task<AdType> CreateAdTypeAsync(AdType adType)
        {
            await _adTypeRepository.AddAsync(adType);
            await _adTypeRepository.SaveChangesAsync();
            return adType;
        }

        public async Task<AdType?> UpdateAdTypeAsync(int id, AdType adType)
        {
            var existingAdType = await _adTypeRepository.GetByIdAsync(id);
            if (existingAdType == null)
            {
                return null;
            }

            existingAdType.TypeName = adType.TypeName;
            existingAdType.TypeDescription = adType.TypeDescription;
            existingAdType.Dimensions = adType.Dimensions;
            existingAdType.Duration = adType.Duration;
            existingAdType.FileFormat = adType.FileFormat;

            _adTypeRepository.Update(existingAdType);
            await _adTypeRepository.SaveChangesAsync();
            return existingAdType;
        }

        public async Task<bool> DeleteAdTypeAsync(int id)
        {
            var adType = await _adTypeRepository.GetByIdAsync(id);
            if (adType == null)
            {
                return false;
            }

            _adTypeRepository.Delete(adType);
            await _adTypeRepository.SaveChangesAsync();
            return true;
        }
    }
}