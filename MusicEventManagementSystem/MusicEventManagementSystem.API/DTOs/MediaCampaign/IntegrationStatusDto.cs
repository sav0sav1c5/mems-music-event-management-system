using System.ComponentModel.DataAnnotations;
using MusicEventManagementSystem.API.Enums;

namespace MusicEventManagementSystem.API.DTOs.MediaCampaign
{
    public class IntegrationStatusResponseDto
    {
        public int IntegrationStatusId { get; set; }
        public int AdId { get; set; }
        public int ChannelId { get; set; }
        public StatusIntegration? Status { get; set; }
        public DateTime? PublicationDate { get; set; }
        public string? Error { get; set; }
        public DateTime? LastSynced { get; set; }
    }

    public class IntegrationStatusCreateDto
    {
        [Required]
        public int AdId { get; set; }
        [Required]
        public int ChannelId { get; set; }
        public StatusIntegration? Status { get; set; }
        public DateTime? PublicationDate { get; set; }
        [StringLength(500)]
        public string? Error { get; set; }
        public DateTime? LastSynced { get; set; }
    }

    public class IntegrationStatusUpdateDto
    {
        public int? AdId { get; set; }
        public int? ChannelId { get; set; }
        public StatusIntegration? Status { get; set; }
        public DateTime? PublicationDate { get; set; }
        [StringLength(500)]
        public string? Error { get; set; }
        public DateTime? LastSynced { get; set; }
    }
}