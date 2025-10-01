using MusicEventManagementSystem.Enums;
using MusicEventManagementSystem.Models.Auth;
using System;
using System.Collections.Generic;

namespace MusicEventManagementSystem.API.Models
{
    public class Event
    {
        public int Id { get; set; } // Promenjeno sa Guid na int
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime Interval { get; set; } // Start
        public DateTime? EndInterval { get; set; } // Dodato
        public EventStatus Status { get; set; }
        public string CreatedById { get; set; } = string.Empty;
        public int LocationId { get; set; }
        public Location Location { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }

        // Navigation property - Event - (1,N) -> TicketType
        public ICollection<TicketType> TicketTypes { get; set; } = new List<TicketType>();

        // Navigation property - Event - (1,N) -> PricingRule
        public ICollection<PricingRule> PricingRules { get; set; } = new List<PricingRule>();

        // Navigation property za CreatedBy (Identity User)
        public ApplicationUser CreatedBy { get; set; }
    }
}
