using MusicEventManagementSystem.Core.Enums.TicketSales;
using System.ComponentModel.DataAnnotations;

namespace MusicEventManagementSystem.Core.Models.Entities.TicketSales
{
    public class ZoneResponseDto
    {
        public int ZoneId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int Capacity { get; set; }
        public decimal BasePrice { get; set; }
        public ZonePosition Position { get; set; }
        public int SegmentId { get; set; }
        public List<int>? TicketTypeIds { get; set; }
    }

    public class ZoneCreateDto
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
        [Range(0, double.MaxValue)]
        public decimal BasePrice { get; set; }

        [Required]
        public ZonePosition Position { get; set; }

        [Required]
        public int SegmentId { get; set; }
    }

    public class ZoneUpdateDto
    {
        [StringLength(100)]
        public string? Name { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        [Range(1, int.MaxValue)]
        public int? Capacity { get; set; }

        [Range(0, double.MaxValue)]
        public decimal? BasePrice { get; set; }

        public ZonePosition? Position { get; set; }
        public int? SegmentId { get; set; }
    }
}
