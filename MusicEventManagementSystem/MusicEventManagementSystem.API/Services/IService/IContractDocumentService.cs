using MusicEventManagementSystem.API.DTOs;

namespace MusicEventManagementSystem.API.Services.IService
{
    public interface IContractDocumentService
    {
        /// <summary>
        /// Check if a contract document can be uploaded (Phase 5 validation)
        /// </summary>
        Task<ContractDocumentPermissionResult> CanUploadContractDocumentAsync(int contractId);

        /// <summary>
        /// Upload a contract PDF document
        /// </summary>
        Task<ContractDocumentUploadResult> UploadContractDocumentAsync(int contractId, IFormFile file);

        /// <summary>
        /// Get contract document file information and path
        /// </summary>
        Task<ContractDocumentResult> GetContractDocumentAsync(int contractId);

        /// <summary>
        /// Get contract document information without file content
        /// </summary>
        Task<ContractDocumentInfoResult> GetContractDocumentInfoAsync(int contractId);

        /// <summary>
        /// Check if a contract document can be deleted
        /// </summary>
        Task<ContractDocumentPermissionResult> CanDeleteContractDocumentAsync(int contractId);

        /// <summary>
        /// Delete a contract document
        /// </summary>
        Task<ContractDocumentOperationResult> DeleteContractDocumentAsync(int contractId);

        /// <summary>
        /// Replace an existing contract document with a new one
        /// </summary>
        Task<ContractDocumentUploadResult> ReplaceContractDocumentAsync(int contractId, IFormFile file);
    }

    public class ContractDocumentPermissionResult
    {
        public bool IsAllowed { get; set; }
        public string Reason { get; set; } = string.Empty;
    }

    public class ContractDocumentUploadResult
    {
        public bool Success { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public DateTime UploadedAt { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
    }

    public class ContractDocumentResult
    {
        public bool Success { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
    }

    public class ContractDocumentInfoResult
    {
        public bool Success { get; set; }
        public bool HasDocument { get; set; }
        public string FileName { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public DateTime? UploadedAt { get; set; }
        public bool CanUpload { get; set; }
        public bool CanDownload { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
    }

    public class ContractDocumentOperationResult
    {
        public bool Success { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
    }
}