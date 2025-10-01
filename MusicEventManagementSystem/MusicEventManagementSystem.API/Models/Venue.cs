using MusicEventManagementSystem.API.Enums.TicketSales;
using System.Text.Json.Serialization;

namespace MusicEventManagementSystem.API.Models
{
    public class Venue
    {
        public int VenueId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? City { get; set; }
        public string? Address { get; set; }
        public int Capacity { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public VenueType? VenueType { get; set; }

        // Navigation property - Venue - (1,N) -> Segment
        public ICollection<Segment> Segments { get; set; } = new List<Segment>();
    }
}
