using System.ComponentModel.DataAnnotations;

namespace MusicEventManagementSystem.API.DTOs.MediaCampaign
{
    public class MediaChannelResponseDto
    {
        public int MediaChannelId { get; set; }
        public string? PlatformType { get; set; }
        public string? APIKey { get; set; }
        public string? APIURL { get; set; }
        public string? APIVersion { get; set; }
    }

    public class MediaChannelCreateDto
    {
        [Required]
        [StringLength(50)]
        public string PlatformType { get; set; }

        [StringLength(200)]
        public string? APIKey { get; set; }

        [StringLength(200)]
        public string? APIURL { get; set; }

        [StringLength(10)]
        public string? APIVersion { get; set; }
    }

    public class MediaChannelUpdateDto
    {
        [StringLength(50)]
        public string? PlatformType { get; set; }

        [StringLength(200)]
        public string? APIKey { get; set; }

        [StringLength(200)]
        public string? APIURL { get; set; }

        [StringLength(10)]
        public string? APIVersion { get; set; }
    }
}