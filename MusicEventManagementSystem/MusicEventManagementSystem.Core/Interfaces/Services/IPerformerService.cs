using MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication;

namespace MusicEventManagementSystem.Core.Interfaces.Services
{
    public interface IPerformerService
    {
        Task<IEnumerable<PerformerResponseDto>> GetAllPerformersAsync();
        Task<PerformerResponseDto?> GetPerformerByIdAsync(int id);
        Task<PerformerResponseDto> CreatePerformerAsync(CreatePerformerDto performerDto);
        Task<PerformerResponseDto?> UpdatePerformerAsync(int id, UpdatePerformerDto performerDto);
        Task<bool> DeletePerformerAsync(int id);

        Task<PerformerResponseDto?> GetByNameAsync(string name);
        Task<IEnumerable<PerformerResponseDto>> GetByGenreAsync(string genre);
    }
}