using System.ComponentModel.DataAnnotations;

namespace MusicEventManagementSystem.API.DTOs.MediaCampaign
{
    public class AdTypeResponseDto
    {
        public int AdTypeId { get; set; }
        public string? TypeName { get; set; }
        public string? TypeDescription { get; set; }
        public string? Dimensions { get; set; }
        public int Duration { get; set; }
        public string? FileFormat { get; set; }
    }

    public class AdTypeCreateDto
    {
        [Required]
        [StringLength(100)]
        public string TypeName { get; set; }

        [StringLength(500)]
        public string? TypeDescription { get; set; }

        [StringLength(50)]
        public string? Dimensions { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int Duration { get; set; }

        [Required]
        [StringLength(20)]
        public string FileFormat { get; set; }
    }

    public class AdTypeUpdateDto
    {
        [StringLength(100)]
        public string? TypeName { get; set; }

        [StringLength(500)]
        public string? TypeDescription { get; set; }

        [StringLength(50)]
        public string? Dimensions { get; set; }

        [Range(1, int.MaxValue)]
        public int? Duration { get; set; }

        [StringLength(20)]
        public string? FileFormat { get; set; }
    }
}