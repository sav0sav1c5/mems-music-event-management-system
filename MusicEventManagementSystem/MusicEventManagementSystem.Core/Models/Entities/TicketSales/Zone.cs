using MusicEventManagementSystem.Core.Enums.TicketSales;

namespace MusicEventManagementSystem.Core.Models.Entities.TicketSales
{
    public class Zone
    {
        public int ZoneId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int Capacity { get; set; }
        public decimal BasePrice { get; set; }
        public ZonePosition Position { get; set; }

        // Navigation property - Zone - (1,1) -> Segment
        public int SegmentId { get; set; }
        public Segment? Segment { get; set; }

        // Navigation property - Zone - (1,N) -> TicketType
        public ICollection<TicketType> TicketTypes { get; set; } = new List<TicketType>();
    }
}
