using MusicEventManagementSystem.Core.Enums.TicketSales;
using System.ComponentModel.DataAnnotations;

namespace MusicEventManagementSystem.Core.Models.Entities.TicketSales
{
    public class TicketResponseDto
    {
        public int TicketId { get; set; }
        public string? UniqueCode { get; set; }
        public string? QrCode { get; set; }
        public DateTime IssueDate { get; set; }
        public decimal FinalPrice { get; set; }
        public TicketStatus Status { get; set; }
        public int TicketTypeId { get; set; }
        public int? RecordedSaleId { get; set; }
    }

    public class TicketCreateDto
    {
        [StringLength(50)]
        public string? UniqueCode { get; set; }

        [StringLength(500)]
        public string? QrCode { get; set; }

        [Required]
        public DateTime IssueDate { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal FinalPrice { get; set; }

        [Required]
        public TicketStatus Status { get; set; }

        [Required]
        public int TicketTypeId { get; set; }

        public int? RecordedSaleId { get; set; }
    }

    public class TicketUpdateDto
    {
        [StringLength(50)]
        public string? UniqueCode { get; set; }

        [StringLength(500)]
        public string? QrCode { get; set; }

        public DateTime? IssueDate { get; set; }

        [Range(0, double.MaxValue)]
        public decimal? FinalPrice { get; set; }

        public TicketStatus? Status { get; set; }
        public int? RecordedSaleId { get; set; }
    }
}
