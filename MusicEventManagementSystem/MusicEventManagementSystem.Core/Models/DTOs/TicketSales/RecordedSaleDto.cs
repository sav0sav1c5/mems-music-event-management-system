using MusicEventManagementSystem.Core.Enums.TicketSales;
using System.ComponentModel.DataAnnotations;

namespace MusicEventManagementSystem.Core.Models.Entities.TicketSales
{
    public class RecordedSaleResponseDto
    {
        public int RecordedSaleId { get; set; }
        public decimal TotalAmount { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public DateTime SaleDate { get; set; }
        public TransactionStatus TransactionStatus { get; set; }
        public string ApplicationUserId { get; set; }
        public List<int>? TicketIds { get; set; }
        public List<int>? SpecialOfferIds { get; set; }
    }

    public class RecordedSaleCreateDto
    {
        [Required]
        [Range(0, double.MaxValue)]
        public decimal TotalAmount { get; set; }

        [Required]
        public PaymentMethod PaymentMethod { get; set; }

        [Required]
        public DateTime SaleDate { get; set; }

        [Required]
        public TransactionStatus TransactionStatus { get; set; }

        [Required]
        public string ApplicationUserId { get; set; }
    }

    public class RecordedSaleUpdateDto
    {
        [Range(0, double.MaxValue)]
        public decimal? TotalAmount { get; set; }

        public PaymentMethod? PaymentMethod { get; set; }
        public DateTime? SaleDate { get; set; }
        public TransactionStatus? TransactionStatus { get; set; }
    }
}
