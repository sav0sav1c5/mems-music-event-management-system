using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MusicEventManagementSystem.Core.Models.DTOs.Client
{
    public class EventDetailsDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? Status { get; set; }

        // Venue Information
        public List<VenueInfoDto>? Venues { get; set; }

        // Performer Information
        public List<PerformerInfoDto>? Performers { get; set; }

        // Available Tickets grouped by Zone
        public List<TicketZoneDto>? TicketZones { get; set; }
    }
}
