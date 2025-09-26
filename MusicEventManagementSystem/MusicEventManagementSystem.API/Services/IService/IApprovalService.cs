using MusicEventManagementSystem.API.Models;

namespace MusicEventManagementSystem.API.Services.IService
{
    public interface IApprovalService
    {
        Task<IEnumerable<Approval>> GetAllApprovalsAsync();
        Task<Approval?> GetApprovalByIdAsync(int id);
        Task<Approval> CreateApprovalAsync(Approval approval);
        Task<Approval?> UpdateApprovalAsync(int id, Approval approval);
        Task<bool> DeleteApprovalAsync(int id);
    }
}