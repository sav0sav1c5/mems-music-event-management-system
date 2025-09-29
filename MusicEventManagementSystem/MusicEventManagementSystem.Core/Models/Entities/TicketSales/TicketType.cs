using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.Core.Models.Entities.TicketSales
{
    public class TicketType
    {
        public int TicketTypeId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int AvailableQuantity { get; set; }
        public TicketTypeStatus Status { get; set; }

        public int ZoneId { get; set; }
        public Zone? Zone { get; set; }

        public int EventId { get; set; }
        public Event? Event { get; set; }

        // Navigation property - TicketType - (1,N) -> Ticket
        public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();

        // Navigation property - TicketType - (0,N) -> SpecialOffer
        public ICollection<SpecialOffer> SpecialOffers { get; set; } = new List<SpecialOffer>();

        // Navigation property - TicketType - (0,N) -> PriceRules
        public ICollection<PricingRule> PricingRules { get; set; } = new List<PricingRule>();
    }
}
