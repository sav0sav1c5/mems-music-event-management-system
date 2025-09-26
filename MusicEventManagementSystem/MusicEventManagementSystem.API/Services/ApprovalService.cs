using MusicEventManagementSystem.API.DTOs.MediaCampaign;
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

        public async Task<IEnumerable<ApprovalResponseDto>> GetAllApprovalsAsync()
        {
            var approvals = await _approvalRepository.GetAllAsync();
            return approvals.Select(MapToResponseDto);
        }

        public async Task<ApprovalResponseDto?> GetApprovalByIdAsync(int id)
        {
            var approval = await _approvalRepository.GetByIdAsync(id);
            return approval == null ? null : MapToResponseDto(approval);
        }

        public async Task<ApprovalResponseDto> CreateApprovalAsync(ApprovalCreateDto dto)
        {
            var approval = MapToEntity(dto);
            await _approvalRepository.AddAsync(approval);
            await _approvalRepository.SaveChangesAsync();
            return MapToResponseDto(approval);
        }

        public async Task<ApprovalResponseDto?> UpdateApprovalAsync(int id, ApprovalUpdateDto dto)
        {
            var approval = await _approvalRepository.GetByIdAsync(id);
            if (approval == null) return null;

            if (dto.ApprovalStatus != null) approval.ApprovalStatus = dto.ApprovalStatus;
            if (dto.Comment != null) approval.Comment = dto.Comment;
            if (dto.ApprovalDate.HasValue) approval.ApprovalDate = dto.ApprovalDate.Value;
            if (dto.MediaTaskId.HasValue) approval.MediaTaskId = dto.MediaTaskId.Value;

            _approvalRepository.Update(approval);
            await _approvalRepository.SaveChangesAsync();
            return MapToResponseDto(approval);
        }

        public async Task<bool> DeleteApprovalAsync(int id)
        {
            var approval = await _approvalRepository.GetByIdAsync(id);
            if (approval == null) return false;
            _approvalRepository.Delete(approval);
            await _approvalRepository.SaveChangesAsync();
            return true;
        }

        private static ApprovalResponseDto MapToResponseDto(Approval approval) => new()
        {
            ApprovalId = approval.ApprovalId,
            ApprovalStatus = approval.ApprovalStatus,
            Comment = approval.Comment,
            ApprovalDate = approval.ApprovalDate,
            MediaTaskId = approval.MediaTaskId
        };

        private static Approval MapToEntity(ApprovalCreateDto dto) => new()
        {
            ApprovalStatus = dto.ApprovalStatus,
            Comment = dto.Comment,
            ApprovalDate = dto.ApprovalDate,
            MediaTaskId = dto.MediaTaskId
        };
    }
}