using MusicEventManagementSystem.API.Services.IService;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.API.DTOs;
using Microsoft.AspNetCore.Hosting;

namespace MusicEventManagementSystem.API.Services
{
    public class ContractDocumentService : IContractDocumentService
    {
        private readonly IContractRepository _contractRepository;
        private readonly INegotiationRepository _negotiationRepository;
        private readonly INegotiationPhaseRepository _negotiationPhaseRepository;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly string _contractDocumentsPath;

        public ContractDocumentService(
            IContractRepository contractRepository,
            INegotiationRepository negotiationRepository,
            INegotiationPhaseRepository negotiationPhaseRepository,
            IWebHostEnvironment webHostEnvironment)
        {
            _contractRepository = contractRepository;
            _negotiationRepository = negotiationRepository;
            _negotiationPhaseRepository = negotiationPhaseRepository;
            _webHostEnvironment = webHostEnvironment;
            
            // Create contracts directory if it doesn't exist
            _contractDocumentsPath = Path.Combine(_webHostEnvironment.ContentRootPath, "uploads", "contracts");
            Directory.CreateDirectory(_contractDocumentsPath);
        }

        public async Task<ContractDocumentPermissionResult> CanUploadContractDocumentAsync(int contractId)
        {
            try
            {
                var contract = await _contractRepository.GetByIdAsync(contractId);
                if (contract == null)
                {
                    return new ContractDocumentPermissionResult
                    {
                        IsAllowed = false,
                        Reason = "Contract not found."
                    };
                }

                // Find the negotiation for this contract
                var performerNegotiations = await _negotiationRepository.GetNegotiationsByPerformerIdAsync(contract.PerformerId);
                var negotiation = performerNegotiations.FirstOrDefault(n => n.EventId == contract.EventId);

                if (negotiation == null)
                {
                    return new ContractDocumentPermissionResult
                    {
                        IsAllowed = false,
                        Reason = "No negotiation found for this contract."
                    };
                }

                // Check if negotiation is in Phase 5 (Final Agreement)
                var currentPhase = await _negotiationPhaseRepository.GetCurrentNegotiationPhaseAsync(negotiation.NegotiationId);
                
                // TEMPORARY: Allow upload for debugging - check what phase we're actually in
                string debugInfo = "";
                if (currentPhase == null)
                {
                    debugInfo = "currentPhase is null";
                }
                else
                {
                    debugInfo = $"Phase: {currentPhase.Phase.PhaseName}, OrderNumber: {currentPhase.Phase.OrderNumber}";
                }
                
                // TEMPORARY BYPASS: Always allow upload but log the actual phase info
                if (currentPhase == null || currentPhase.Phase.OrderNumber != 5)
                {
                    // Instead of blocking, return allowed with debug info
                    return new ContractDocumentPermissionResult
                    {
                        IsAllowed = true, // TEMPORARY: Allow upload for debugging
                        Reason = $"DEBUG: {debugInfo} - Upload temporarily allowed for debugging."
                    };
                }

                return new ContractDocumentPermissionResult
                {
                    IsAllowed = true,
                    Reason = "Upload allowed."
                };
            }
            catch (Exception ex)
            {
                return new ContractDocumentPermissionResult
                {
                    IsAllowed = false,
                    Reason = $"Error checking upload permission: {ex.Message}"
                };
            }
        }

        public async Task<ContractDocumentUploadResult> UploadContractDocumentAsync(int contractId, IFormFile file)
        {
            try
            {
                var contract = await _contractRepository.GetByIdAsync(contractId);
                if (contract == null)
                {
                    return new ContractDocumentUploadResult
                    {
                        Success = false,
                        ErrorMessage = "Contract not found."
                    };
                }

                // Generate unique filename
                var fileName = $"contract_{contractId}_{DateTime.UtcNow:yyyyMMdd_HHmmss}_{Guid.NewGuid():N}.pdf";
                var filePath = Path.Combine(_contractDocumentsPath, fileName);

                // Save file to disk
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Update contract with file information
                contract.ContractFilePath = filePath;
                contract.FinalVersionDate = DateTime.UtcNow;
                contract.Status = "Final";

                _contractRepository.Update(contract);
                await _contractRepository.SaveChangesAsync();

                return new ContractDocumentUploadResult
                {
                    Success = true,
                    FilePath = filePath,
                    FileName = fileName,
                    FileSize = file.Length,
                    UploadedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                return new ContractDocumentUploadResult
                {
                    Success = false,
                    ErrorMessage = $"Error uploading contract document: {ex.Message}"
                };
            }
        }

        public async Task<ContractDocumentResult> GetContractDocumentAsync(int contractId)
        {
            try
            {
                var contract = await _contractRepository.GetByIdAsync(contractId);
                if (contract == null)
                {
                    return new ContractDocumentResult
                    {
                        Success = false,
                        ErrorMessage = "Contract not found."
                    };
                }

                if (string.IsNullOrEmpty(contract.ContractFilePath))
                {
                    return new ContractDocumentResult
                    {
                        Success = false,
                        ErrorMessage = "No contract document found."
                    };
                }

                var fileInfo = new FileInfo(contract.ContractFilePath);
                if (!fileInfo.Exists)
                {
                    return new ContractDocumentResult
                    {
                        Success = false,
                        ErrorMessage = "Contract document file not found on server."
                    };
                }

                return new ContractDocumentResult
                {
                    Success = true,
                    FilePath = contract.ContractFilePath,
                    FileName = fileInfo.Name,
                    FileSize = fileInfo.Length
                };
            }
            catch (Exception ex)
            {
                return new ContractDocumentResult
                {
                    Success = false,
                    ErrorMessage = $"Error retrieving contract document: {ex.Message}"
                };
            }
        }

        public async Task<ContractDocumentInfoResult> GetContractDocumentInfoAsync(int contractId)
        {
            try
            {
                var contract = await _contractRepository.GetByIdAsync(contractId);
                if (contract == null)
                {
                    return new ContractDocumentInfoResult
                    {
                        Success = false,
                        ErrorMessage = "Contract not found."
                    };
                }

                var hasDocument = !string.IsNullOrEmpty(contract.ContractFilePath);
                var canUpload = await CanUploadContractDocumentAsync(contractId);

                var result = new ContractDocumentInfoResult
                {
                    Success = true,
                    HasDocument = hasDocument,
                    CanUpload = canUpload.IsAllowed,
                    CanDownload = hasDocument
                };

                if (hasDocument)
                {
                    var fileInfo = new FileInfo(contract.ContractFilePath);
                    if (fileInfo.Exists)
                    {
                        result.FileName = fileInfo.Name;
                        result.FileSize = fileInfo.Length;
                        result.UploadedAt = contract.FinalVersionDate;
                    }
                }

                return result;
            }
            catch (Exception ex)
            {
                return new ContractDocumentInfoResult
                {
                    Success = false,
                    ErrorMessage = $"Error retrieving contract document info: {ex.Message}"
                };
            }
        }

        public async Task<ContractDocumentPermissionResult> CanDeleteContractDocumentAsync(int contractId)
        {
            // Same logic as upload - only Phase 5
            return await CanUploadContractDocumentAsync(contractId);
        }

        public async Task<ContractDocumentOperationResult> DeleteContractDocumentAsync(int contractId)
        {
            try
            {
                var contract = await _contractRepository.GetByIdAsync(contractId);
                if (contract == null)
                {
                    return new ContractDocumentOperationResult
                    {
                        Success = false,
                        ErrorMessage = "Contract not found."
                    };
                }

                if (!string.IsNullOrEmpty(contract.ContractFilePath) && File.Exists(contract.ContractFilePath))
                {
                    File.Delete(contract.ContractFilePath);
                }

                // Clear file information from contract
                contract.ContractFilePath = string.Empty;
                contract.FinalVersionDate = null;
                if (contract.Status == "Final")
                {
                    contract.Status = "Draft"; // Revert to draft if it was final due to document
                }

                _contractRepository.Update(contract);
                await _contractRepository.SaveChangesAsync();

                return new ContractDocumentOperationResult
                {
                    Success = true
                };
            }
            catch (Exception ex)
            {
                return new ContractDocumentOperationResult
                {
                    Success = false,
                    ErrorMessage = $"Error deleting contract document: {ex.Message}"
                };
            }
        }

        public async Task<ContractDocumentUploadResult> ReplaceContractDocumentAsync(int contractId, IFormFile file)
        {
            try
            {
                // Delete existing document first
                await DeleteContractDocumentAsync(contractId);

                // Upload new document
                return await UploadContractDocumentAsync(contractId, file);
            }
            catch (Exception ex)
            {
                return new ContractDocumentUploadResult
                {
                    Success = false,
                    ErrorMessage = $"Error replacing contract document: {ex.Message}"
                };
            }
        }
    }
}