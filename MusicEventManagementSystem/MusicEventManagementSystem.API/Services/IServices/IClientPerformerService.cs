using MusicEventManagementSystem.Core.Models.DTOs.Client;

namespace MusicEventManagementSystem.API.Services.IServices
{
    public interface IClientPerformerService
    {
        Task<IEnumerable<PerformerInfoDto>> GetFeaturedPerformersAsync();
        Task<PerformerInfoDto?> GetPerformerDetailsAsync(int performerId);
        Task<IEnumerable<PerformerInfoDto>> SearchPerformersAsync(string? keyword, string? genre);
    }
}
