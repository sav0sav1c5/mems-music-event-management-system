using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.Core.Models.Entities.TicketSales
{
    public class PricingRule
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

        // Navigation property - PricingRule - (0,N) -> TicketType
        public ICollection<TicketType> TicketTypes { get; set; } = new List<TicketType>();

        // Navigation property - PricingRule - (0,N) -> Event
        public ICollection<Event> Events { get; set; } = new List<Event>();
    }
}
