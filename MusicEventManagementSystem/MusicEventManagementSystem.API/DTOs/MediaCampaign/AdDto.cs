using System.ComponentModel.DataAnnotations;
using MusicEventManagementSystem.Enums;

namespace MusicEventManagementSystem.API.DTOs.MediaCampaign
{
    public class AdResponseDto
    {
        public int AdId { get; set; }
        public DateTime Deadline { get; set; }
        public string? Title { get; set; }
        public DateTime CreationDate { get; set; }
        public AdStatus CurrentPhase { get; set; }
        public DateTime? PublicationDate { get; set; }
        public int MediaWorkflowId { get; set; }
        public int CampaignId { get; set; }
        public int AdTypeId { get; set; }
    }

    public class AdCreateDto
    {
        [Required]
        public DateTime Deadline { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; }

        [Required]
        public DateTime CreationDate { get; set; }

        [Required]
        public AdStatus CurrentPhase { get; set; }

        public DateTime? PublicationDate { get; set; }

        [Required]
        public int MediaWorkflowId { get; set; }

        [Required]
        public int CampaignId { get; set; }

        [Required]
        public int AdTypeId { get; set; }
    }

    public class AdUpdateDto
    {
        public DateTime? Deadline { get; set; }

        [StringLength(200)]
        public string? Title { get; set; }

        public DateTime? CreationDate { get; set; }

        public AdStatus? CurrentPhase { get; set; }

        public DateTime? PublicationDate { get; set; }

        public int? MediaWorkflowId { get; set; }

        public int? CampaignId { get; set; }

        public int? AdTypeId { get; set; }
    }
}