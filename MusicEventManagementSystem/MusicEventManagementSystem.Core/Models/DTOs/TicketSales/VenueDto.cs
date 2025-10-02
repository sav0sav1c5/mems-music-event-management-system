using MusicEventManagementSystem.Core.Enums.TicketSales;
using System.ComponentModel.DataAnnotations;

namespace MusicEventManagementSystem.Core.Models.Entities.TicketSales
{
    public class VenueResponseDto
    {
        public int VenueId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? City { get; set; }
        public string? Address { get; set; }
        public int Capacity { get; set; }
        public VenueType VenueType { get; set; }
        public int EventId { get; set; }
        public List<int>? SegmentIds { get; set; }
        public List<int>? PerformanceIds { get; set; }
    }

    public class VenueCreateDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        [Required]
        [StringLength(50)]
        public string City { get; set; }

        [Required]
        [StringLength(200)]
        public string Address { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int Capacity { get; set; }

        [Required]
        public VenueType VenueType { get; set; }

        [Required]
        public int EventId { get; set; }
    }

    public class VenueUpdateDto
    {
        [StringLength(100)]
        public string? Name { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        [StringLength(50)]
        public string? City { get; set; }

        [StringLength(200)]
        public string? Address { get; set; }

        [Range(1, int.MaxValue)]
        public int? Capacity { get; set; }

        public VenueType? VenueType { get; set; }
        public int? EventId { get; set; }
    }
}
