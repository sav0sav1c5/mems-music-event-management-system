using System.ComponentModel.DataAnnotations;

namespace MusicEventManagementSystem.API.DTOs.MediaCampaign
{
    public class MediaVersionResponseDto
    {
        public int MediaVersionId { get; set; }
        public string? VersionFileName { get; set; }
        public string? FileType { get; set; }
        public string? FileURL { get; set; }
        public bool IsFinalVersion { get; set; }
        public int AdId { get; set; }
    }

    public class MediaVersionCreateDto
    {
        [Required]
        [StringLength(200)]
        public string VersionFileName { get; set; }

        [StringLength(50)]
        public string? FileType { get; set; }

        [StringLength(500)]
        public string? FileURL { get; set; }

        [Required]
        public bool IsFinalVersion { get; set; }

        [Required]
        public int AdId { get; set; }
    }

    public class MediaVersionUpdateDto
    {
        [StringLength(200)]
        public string? VersionFileName { get; set; }

        [StringLength(50)]
        public string? FileType { get; set; }

        [StringLength(500)]
        public string? FileURL { get; set; }

        public bool? IsFinalVersion { get; set; }

        public int? AdId { get; set; }
    }
}