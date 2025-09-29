using MusicEventManagementSystem.Core.Models.Entities.MediaCampaign;

namespace MusicEventManagementSystem.Core.Interfaces.Services
{
    public interface IApprovalService
    {
        Task<IEnumerable<ApprovalResponseDto>> GetAllApprovalsAsync();
        Task<ApprovalResponseDto?> GetApprovalByIdAsync(int id);
        Task<ApprovalResponseDto> CreateApprovalAsync(ApprovalCreateDto createDto);
        Task<ApprovalResponseDto?> UpdateApprovalAsync(int id, ApprovalUpdateDto updateDto);
        Task<bool> DeleteApprovalAsync(int id);
    }
}