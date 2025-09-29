using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.Core.Models.Entities.TicketSales
{
    public class Venue
    {
        public int VenueId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? City { get; set; }
        public string? Address { get; set; }
        public int Capacity { get; set; }
        public VenueType VenueType { get; set; }

        public int EventId { get; set; }
        public Event Event { get; set; } = null!;

        public ICollection<Segment> Segments { get; set; } = new List<Segment>();
        public ICollection<Performance> Performances { get; set; } = new List<Performance>();
    }
}
