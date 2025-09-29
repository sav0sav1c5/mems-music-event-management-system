using MusicEventManagementSystem.Core.Enums.TicketSales;
using System.ComponentModel.DataAnnotations;

namespace MusicEventManagementSystem.Core.Models.Entities.TicketSales
{
    public class SegmentResponseDto
    {
        public int SegmentId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int Capacity { get; set; }
        public SegmentType SegmentType { get; set; }
        public int VenueId { get; set; }
        public List<int>? Zones { get; set; }
    }

    public class SegmentCreateDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int Capacity { get; set; }

        [Required]
        public SegmentType SegmentType { get; set; }

        [Required]
        public int VenueId { get; set; }
    }

    public class SegmentUpdateDto
    {
        [StringLength(100)]
        public string? Name { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        [Range(1, int.MaxValue)]
        public int? Capacity { get; set; }

        public SegmentType? SegmentType { get; set; }
        public int? VenueId { get; set; }
    }
}
