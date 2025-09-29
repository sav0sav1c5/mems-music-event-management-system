using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Models.Entities.Auth;
using System.ComponentModel.DataAnnotations.Schema;

namespace MusicEventManagementSystem.Core.Models.Entities.TicketSales
{
    public class RecordedSale
    {
        public int RecordedSaleId { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime SaleDate { get; set; }
        public TransactionStatus TransactionStatus { get; set; }
        public PaymentMethod PaymentMethod { get; set; }

        // Navigation property - RecordedSale - (0,N) -> Ticket
        public string ApplicationUserId { get; set; }
        public ApplicationUser? ApplicationUser { get; set; }

        // Navigation property - RecordedSale - (1,N) -> Ticket
        public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();

        // Navigation property - RecordedSale - (0,N) -> SpecialOffer
        public ICollection<SpecialOffer> SpecialOffers { get; set; } = new List<SpecialOffer>();
    }
}
