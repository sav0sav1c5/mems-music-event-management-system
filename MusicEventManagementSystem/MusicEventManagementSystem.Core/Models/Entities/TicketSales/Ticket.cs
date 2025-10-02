using MusicEventManagementSystem.Core.Enums.TicketSales;

namespace MusicEventManagementSystem.Core.Models.Entities.TicketSales
{
    public class Ticket
    {
        public int TicketId { get; set; }
        public string? UniqueCode { get; set; }
        public string? QrCode { get; set; }
        public DateTime IssueDate { get; set; }
        public decimal FinalPrice { get; set; }
        public TicketStatus Status { get; set; }

        // Navigation property - Ticket - (1,1) -> TicketType
        public int TicketTypeId { get; set; }
        public TicketType? TicketType { get; set; }

        // Navigation property - Ticket - (0,1) -> RecordedSale
        public int? RecordedSaleId { get; set; }
        public RecordedSale? RecordedSale { get; set; }
    }
}
