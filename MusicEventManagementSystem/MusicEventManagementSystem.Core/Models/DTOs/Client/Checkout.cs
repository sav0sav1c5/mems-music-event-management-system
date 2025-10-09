using MusicEventManagementSystem.Core.Enums.TicketSales;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MusicEventManagementSystem.Core.Models.DTOs.Client
{
    public class CheckoutRequestDto
    {
        public string ApplicationUserId { get; set; } = string.Empty;
        public PaymentMethod PaymentMethod { get; set; }
        public string? PromoCode { get; set; }
        public List<CartItemDto> CartItems { get; set; } = new();
    }

    public class CheckoutResponseDto
    {
        public int OrderId { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public DateTime OrderDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public List<OrderTicketDto> Tickets { get; set; } = new();
    }
}
