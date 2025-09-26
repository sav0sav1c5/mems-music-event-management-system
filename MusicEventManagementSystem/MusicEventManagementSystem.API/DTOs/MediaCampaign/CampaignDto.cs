using System.ComponentModel.DataAnnotations;

namespace MusicEventManagementSystem.API.DTOs.MediaCampaign
{
    public class CampaignResponseDto
    {
        public int CampaignId { get; set; }
        public int EventId { get; set; }
        public string Name { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal TotalBudget { get; set; }
    }

    public class CampaignCreateDto
    {
        [Required]
        public int EventId { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal TotalBudget { get; set; }
    }

    public class CampaignUpdateDto
    {
        public int? EventId { get; set; }

        [StringLength(200)]
        public string? Name { get; set; }

        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        [Range(0, double.MaxValue)]
        public decimal? TotalBudget { get; set; }
    }
}