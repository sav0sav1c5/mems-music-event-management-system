using MusicEventManagementSystem.Core.Enums.EventOrganization;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;

namespace MusicEventManagementSystem.Core.Models.Entities.EventOrganization
{
    public class Event
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public EventStatus Status { get; set; } 
        public Guid CreatedById { get; set; }
        public int LocationId { get; set; }
        public Location? Location { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }

        public ICollection<Venue> Venues { get; set; } = new List<Venue>();
        public ICollection<TicketType> TicketTypes { get; set; } = new List<TicketType>();
        public ICollection<PricingRule> PricingRules { get; set; } = new List<PricingRule>();
        // public ICollection<Performance> Performances { get; set; } = new List<Performance>();
    }

}
