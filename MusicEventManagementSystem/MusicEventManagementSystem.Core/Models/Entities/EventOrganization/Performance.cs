using MusicEventManagementSystem.Core.Enums.EventOrganization;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;

namespace MusicEventManagementSystem.Core.Models.Entities.EventOrganization
{
    public class Performance
    {
        public int Id { get; set; }

        // public int? EventId { get; set; }
        // public Event? Event { get; set; }

        public int PerformerId { get; set; }
        public Performer Performer { get; set; } = null!;

        public int VenueId { get; set; }
        public Venue Venue { get; set; } = null!;


        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int SetupTime { get; set; }
        public int SoundcheckTime { get; set; }
        public PerformanceStatus Status { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }

    }
}

