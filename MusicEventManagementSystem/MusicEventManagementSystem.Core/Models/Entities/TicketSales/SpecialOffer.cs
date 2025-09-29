using MusicEventManagementSystem.Core.Enums.TicketSales;

namespace MusicEventManagementSystem.Core.Models.Entities.TicketSales
{
    public class SpecialOffer
    {
        public int SpecialOfferId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? ApplicationCondition { get; set; }
        public decimal DiscountValue { get; set; }
        public int TicketLimit { get; set; }
        public OfferType OfferType { get; set; }

        // Navigation property - SpecialOffer - (0,N) -> TicketType
        public ICollection<TicketType> TicketTypes { get; set; } = new List<TicketType>();

        // Navigation property - SpecialOffer - (0,N) -> RecordedSale
        public ICollection<RecordedSale> RecordedSales { get; set; } = new List<RecordedSale>();
    }
}
