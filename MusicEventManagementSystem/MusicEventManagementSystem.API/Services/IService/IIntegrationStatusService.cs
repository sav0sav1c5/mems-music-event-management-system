using MusicEventManagementSystem.API.DTOs.MediaCampaign;

namespace MusicEventManagementSystem.API.Services.IService
{
    public interface IIntegrationStatusService
    {
        Task<IEnumerable<IntegrationStatusResponseDto>> GetAllIntegrationStatusesAsync();
        Task<IntegrationStatusResponseDto?> GetIntegrationStatusByIdAsync(int id);
        Task<IntegrationStatusResponseDto> CreateIntegrationStatusAsync(IntegrationStatusCreateDto createDto);
        Task<IntegrationStatusResponseDto?> UpdateIntegrationStatusAsync(int id, IntegrationStatusUpdateDto updateDto);
        Task<bool> DeleteIntegrationStatusAsync(int id);
    }
}