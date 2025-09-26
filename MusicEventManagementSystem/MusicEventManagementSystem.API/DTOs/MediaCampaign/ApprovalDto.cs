using System.ComponentModel.DataAnnotations;

namespace MusicEventManagementSystem.API.DTOs.MediaCampaign
{
    public class ApprovalResponseDto
    {
        public int ApprovalId { get; set; }
        public string? ApprovalStatus { get; set; }
        public string? Comment { get; set; }
        public DateTime ApprovalDate { get; set; }
        public int MediaTaskId { get; set; }
    }

    public class ApprovalCreateDto
    {
        [Required]
        [StringLength(30)]
        public string ApprovalStatus { get; set; }

        [StringLength(500)]
        public string? Comment { get; set; }

        [Required]
        public DateTime ApprovalDate { get; set; }

        [Required]
        public int MediaTaskId { get; set; }
    }

    public class ApprovalUpdateDto
    {
        [StringLength(30)]
        public string? ApprovalStatus { get; set; }

        [StringLength(500)]
        public string? Comment { get; set; }

        public DateTime? ApprovalDate { get; set; }

        public int? MediaTaskId { get; set; }
    }
}