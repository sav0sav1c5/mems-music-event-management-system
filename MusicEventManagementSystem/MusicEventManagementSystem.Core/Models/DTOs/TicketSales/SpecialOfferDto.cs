using MusicEventManagementSystem.Core.Enums.TicketSales;
using System.ComponentModel.DataAnnotations;

namespace MusicEventManagementSystem.Core.Models.Entities.TicketSales
{
    public class SpecialOfferResponseDto
    {
        public int SpecialOfferId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public OfferType OfferType { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? ApplicationCondition { get; set; }
        public decimal DiscountValue { get; set; }
        public int TicketLimit { get; set; }
        public List<int>? TicketTypeIds { get; set; }
        public List<int>? RecordedSaleIds { get; set; }
    }

    public class SpecialOfferCreateDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        [Required]
        public OfferType OfferType { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        public string? ApplicationCondition { get; set; }

        [Required]
        [Range(0, 100)]
        public decimal DiscountValue { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int TicketLimit { get; set; }
    }

    public class SpecialOfferUpdateDto
    {
        [StringLength(100)]
        public string? Name { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        public OfferType? OfferType { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? ApplicationCondition { get; set; }

        [Range(0, 100)]
        public decimal? DiscountValue { get; set; }

        [Range(1, int.MaxValue)]
        public int? TicketLimit { get; set; }
    }
}
