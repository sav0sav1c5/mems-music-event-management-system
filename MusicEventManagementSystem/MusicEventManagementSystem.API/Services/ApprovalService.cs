using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.API.Services.IService;

namespace MusicEventManagementSystem.API.Services
{
    public class ApprovalService : IApprovalService
    {
        private readonly IApprovalRepository _approvalRepository;

        public ApprovalService(IApprovalRepository approvalRepository)
        {
            _approvalRepository = approvalRepository;
        }

        public async Task<IEnumerable<Approval>> GetAllApprovalsAsync()
        {
            return await _approvalRepository.GetAllAsync();
        }

        public async Task<Approval?> GetApprovalByIdAsync(int id)
        {
            return await _approvalRepository.GetByIdAsync(id);
        }

        public async Task<Approval> CreateApprovalAsync(Approval approval)
        {
            await _approvalRepository.AddAsync(approval);
            await _approvalRepository.SaveChangesAsync();
            return approval;
        }

        public async Task<Approval?> UpdateApprovalAsync(int id, Approval approval)
        {
            var existingApproval = await _approvalRepository.GetByIdAsync(id);
            if (existingApproval == null)
            {
                return null;
            }

            existingApproval.ApprovalStatus = approval.ApprovalStatus;
            existingApproval.Comment = approval.Comment;
            existingApproval.ApprovalDate = approval.ApprovalDate;
            existingApproval.MediaTaskId = approval.MediaTaskId;

            _approvalRepository.Update(existingApproval);
            await _approvalRepository.SaveChangesAsync();
            return existingApproval;
        }

        public async Task<bool> DeleteApprovalAsync(int id)
        {
            var approval = await _approvalRepository.GetByIdAsync(id);
            if (approval == null)
            {
                return false;
            }

            _approvalRepository.Delete(approval);
            await _approvalRepository.SaveChangesAsync();
            return true;
        }
    }
}