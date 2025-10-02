using MusicEventManagementSystem.Core.Enums.EventOrganization;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;

namespace MusicEventManagementSystem.Core.Models.Entities.EventOrganization
{
    public class Performance
    {
        public int Id { get; set; }
<<<<<<< HEAD:MusicEventManagementSystem/MusicEventManagementSystem.API/Models/Performance.cs
        public int EventId { get; set; }
        public Event? Event { get; set; }

        public int PerformerId { get; set; }
        public Performer? Performer { get; set; }

        public int VenueId { get; set; }
        public Venue? Venue { get; set; }
=======

        // public int? EventId { get; set; }
        // public Event? Event { get; set; }

        public int PerformerId { get; set; }
        public Performer Performer { get; set; } = null!;

        public int VenueId { get; set; }
        public Venue Venue { get; set; } = null!;
>>>>>>> fc7d1e8729b7d2d6668f9b466d7f35e20a9a6543:MusicEventManagementSystem/MusicEventManagementSystem.Core/Models/Entities/EventOrganization/Performance.cs


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

