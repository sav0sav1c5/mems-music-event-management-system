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

        public List<int> TicketIds { get; set; } = new();
    }

    public class RecordedSaleUpdateDto
    {
        [Range(0, double.MaxValue)]
        public decimal? TotalAmount { get; set; }

        public PaymentMethod? PaymentMethod { get; set; }
        public DateTime? SaleDate { get; set; }
        public TransactionStatus? TransactionStatus { get; set; }
    }

    public class SalesAuditLogDto
    {
        public int AuditId { get; set; }
        public int RecordedSaleId { get; set; }
        public string Action { get; set; } // INSERT, UPDATE, DELETE
        public decimal? OldTotalAmount { get; set; }
        public decimal? NewTotalAmount { get; set; }
        public int TicketCount { get; set; }
        public DateTime ChangedAt { get; set; }
        public string ChangedBy { get; set; }
    }

    public class IndexPerformanceDto
    {
        public string TestName { get; set; }
        public decimal ExecutionTimeMs { get; set; }
        public long RowsReturned { get; set; }
        public bool IndexUsed { get; set; }
    }
}
