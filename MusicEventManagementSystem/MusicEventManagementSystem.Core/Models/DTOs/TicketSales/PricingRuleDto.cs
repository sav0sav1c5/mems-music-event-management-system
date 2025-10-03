using MusicEventManagementSystem.Core.Enums.TicketSales;
using System.ComponentModel.DataAnnotations;

namespace MusicEventManagementSystem.Core.Models.Entities.TicketSales
{
    public class PricingRuleResponseDto
    {
        public int PricingRuleId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public decimal MinimumPrice { get; set; }
        public decimal MaximumPrice { get; set; }
        public decimal OccupancyPercentage1 { get; set; }
        public decimal OccupancyPercentage2 { get; set; }
        public decimal OccupancyThreshold1 { get; set; }
        public decimal OccupancyThreshold2 { get; set; }
        public decimal EarlyBirdPercentage { get; set; }
        public PricingCondition PricingCondition { get; set; }
        public string? DynamicCondition { get; set; }
        public decimal Modifier { get; set; }
        public List<int>? EventIds { get; set; }
        public List<int>? TicketTypesIds { get; set; }
    }

    public class PricingRuleCreateDto
    {
        [StringLength(100)]
        public string? Name { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal MinimumPrice { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal MaximumPrice { get; set; }

        [Required]
        [Range(0, 100)]
        public decimal OccupancyPercentage1 { get; set; }

        [Required]
        [Range(0, 100)]
        public decimal OccupancyPercentage2 { get; set; }

        [Required]
        [Range(0, 100)]
        public decimal OccupancyThreshold1 { get; set; }

        [Required]
        [Range(0, 100)]
        public decimal OccupancyThreshold2 { get; set; }

        [Required]
        [Range(0, 100)]
        public decimal EarlyBirdPercentage { get; set; }

        [Required]
        public PricingCondition PricingCondition { get; set; }

        public string? DynamicCondition { get; set; }

        [Required]
        public decimal Modifier { get; set; }

        public List<int>? EventIds { get; set; }
        public List<int>? TicketTypeIds { get; set; }
    }

    public class PricingRuleUpdateDto
    {
        [StringLength(100)]
        public string? Name { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        [Range(0, double.MaxValue)]
        public decimal? MinimumPrice { get; set; }

        [Range(0, double.MaxValue)]
        public decimal? MaximumPrice { get; set; }

        [Range(0, 100)]
        public decimal? OccupancyPercentage1 { get; set; }

        [Range(0, 100)]
        public decimal? OccupancyPercentage2 { get; set; }

        [Range(0, 100)]
        public decimal? OccupancyThreshold1 { get; set; }

        [Range(0, 100)]
        public decimal? OccupancyThreshold2 { get; set; }

        [Range(0, 100)]
        public decimal? EarlyBirdPercentage { get; set; }

        [Required]
        public PricingCondition PricingCondition { get; set; }

        public string? DynamicCondition { get; set; }
        public decimal? Modifier { get; set; }

        public List<int>? EventIds { get; set; }
        public List<int>? TicketTypeIds { get; set; }
    }

    public class CalculatePriceRequestDto
    {
        [Required]
        [Range(0, double.MaxValue)]
        public decimal BasePrice { get; set; }

        [Required]
        [Range(0, 100)]
        public decimal OccupancyRate { get; set; }

        public bool IsEarlyBird { get; set; }
    }
}
