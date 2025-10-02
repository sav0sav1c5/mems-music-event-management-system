using MusicEventManagementSystem.Core.Enums.TicketSales;
using System.ComponentModel.DataAnnotations;

namespace MusicEventManagementSystem.Core.Models.Entities.TicketSales
{
    public class TicketTypeResponseDto
    {
        public int TicketTypeId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public TicketTypeStatus Status { get; set; }
        public int AvailableQuantity { get; set; }
        public int ZoneId { get; set; }
        public int EventId { get; set; }
        public List<int>? TicketIds { get; set; }
        public List<int>? SpecialOfferIds { get; set; }
        public List<int>? PricingRuleIds { get; set; }
    }

    public class TicketTypeCreateDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        [Required]
        public TicketTypeStatus Status { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int AvailableQuantity { get; set; }

        [Required]
        public int ZoneId { get; set; }

        [Required]
        public int EventId { get; set; }
    }

    public class TicketTypeUpdateDto
    {
        [StringLength(100)]
        public string? Name { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        public TicketTypeStatus? Status { get; set; }

        [Range(0, int.MaxValue)]
        public int? AvailableQuantity { get; set; }

        public int? ZoneId { get; set; }
        public int? EventId { get; set; }
    }
}
