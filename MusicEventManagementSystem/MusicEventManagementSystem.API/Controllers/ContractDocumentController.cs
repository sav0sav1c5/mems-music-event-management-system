using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.API.Services.IService;
using MusicEventManagementSystem.API.DTOs;

namespace MusicEventManagementSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContractDocumentController : ControllerBase
    {
        private readonly IContractDocumentService _contractDocumentService;
        private readonly IPhaseService _phaseService;
        private readonly INegotiationService _negotiationService;

        public ContractDocumentController(
            IContractDocumentService contractDocumentService,
            IPhaseService phaseService,
            INegotiationService negotiationService)
        {
            _contractDocumentService = contractDocumentService;
            _phaseService = phaseService;
            _negotiationService = negotiationService;
        }

        /// <summary>
        /// Upload a contract PDF file (Phase 5 only)
        /// </summary>
        [HttpPost("upload/{contractId}")]
        public async Task<ActionResult> UploadContractDocument(int contractId, IFormFile file)
        {
            try
            {
                // Validate file
                if (file == null || file.Length == 0)
                {
                    return BadRequest("No file provided or file is empty.");
                }

                if (!file.ContentType.Equals("application/pdf", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest("Only PDF files are allowed for contract documents.");
                }

                if (file.Length > 10 * 1024 * 1024) // 10MB limit
                {
                    return BadRequest("File size must be less than 10MB.");
                }

                // Check if contract is in the correct phase
                var canUpload = await _contractDocumentService.CanUploadContractDocumentAsync(contractId);
                if (!canUpload.IsAllowed)
                {
                    return BadRequest(canUpload.Reason);
                }

                var result = await _contractDocumentService.UploadContractDocumentAsync(contractId, file);
                
                if (result.Success)
                {
                    return Ok(new
                    {
                        message = "Contract document uploaded successfully",
                        filePath = result.FilePath,
                        fileName = result.FileName,
                        fileSize = result.FileSize,
                        uploadedAt = result.UploadedAt
                    });
                }

                return BadRequest(result.ErrorMessage);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Download a contract PDF file
        /// </summary>
        [HttpGet("download/{contractId}")]
        public async Task<ActionResult> DownloadContractDocument(int contractId)
        {
            try
            {
                var result = await _contractDocumentService.GetContractDocumentAsync(contractId);
                
                if (!result.Success)
                {
                    return NotFound(result.ErrorMessage);
                }

                if (!System.IO.File.Exists(result.FilePath))
                {
                    return NotFound("Contract document file not found on server.");
                }

                var fileBytes = await System.IO.File.ReadAllBytesAsync(result.FilePath);
                return File(fileBytes, "application/pdf", result.FileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Get contract document information
        /// </summary>
        [HttpGet("info/{contractId}")]
        public async Task<ActionResult> GetContractDocumentInfo(int contractId)
        {
            try
            {
                var result = await _contractDocumentService.GetContractDocumentInfoAsync(contractId);
                
                if (!result.Success)
                {
                    return NotFound(result.ErrorMessage);
                }

                return Ok(new
                {
                    hasDocument = result.HasDocument,
                    fileName = result.FileName,
                    fileSize = result.FileSize,
                    uploadedAt = result.UploadedAt,
                    canUpload = result.CanUpload,
                    canDownload = result.CanDownload
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Delete contract document
        /// </summary>
        [HttpDelete("{contractId}")]
        public async Task<ActionResult> DeleteContractDocument(int contractId)
        {
            try
            {
                var canDelete = await _contractDocumentService.CanDeleteContractDocumentAsync(contractId);
                if (!canDelete.IsAllowed)
                {
                    return BadRequest(canDelete.Reason);
                }

                var result = await _contractDocumentService.DeleteContractDocumentAsync(contractId);
                
                if (result.Success)
                {
                    return Ok(new { message = "Contract document deleted successfully" });
                }

                return BadRequest(result.ErrorMessage);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Replace existing contract document with a new one
        /// </summary>
        [HttpPut("replace/{contractId}")]
        public async Task<ActionResult> ReplaceContractDocument(int contractId, IFormFile file)
        {
            try
            {
                // Validate file
                if (file == null || file.Length == 0)
                {
                    return BadRequest("No file provided or file is empty.");
                }

                if (!file.ContentType.Equals("application/pdf", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest("Only PDF files are allowed for contract documents.");
                }

                var result = await _contractDocumentService.ReplaceContractDocumentAsync(contractId, file);
                
                if (result.Success)
                {
                    return Ok(new
                    {
                        message = "Contract document replaced successfully",
                        filePath = result.FilePath,
                        fileName = result.FileName,
                        fileSize = result.FileSize,
                        uploadedAt = result.UploadedAt
                    });
                }

                return BadRequest(result.ErrorMessage);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}