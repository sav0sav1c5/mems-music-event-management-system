using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MusicEventManagementSystem.Core.Models.DTOs.Client
{
    public class OrderDto
    {
        public int OrderId { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public int TotalTickets { get; set; }
        public List<OrderItemDto> Items { get; set; } = new();
    }

    public class OrderItemDto
    {
        public string? EventName { get; set; }
        public string? TicketTypeName { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Subtotal { get; set; }
    }

    public class OrderTicketDto
    {
        public int TicketId { get; set; }
        public string? UniqueCode { get; set; }
        public string? QrCode { get; set; }
        public string? EventName { get; set; }
        public string? TicketTypeName { get; set; }
        public string? ZoneName { get; set; }
        public DateTime EventStartDate { get; set; }
        public decimal Price { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class OrderDetailsDto
    {
        public int OrderId { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public List<OrderTicketDto> Tickets { get; set; } = new();
        public List<AppliedOfferDto> AppliedOffers { get; set; } = new();
    }

    public class AppliedOfferDto
    {
        public string? OfferName { get; set; }
        public string? Description { get; set; }
        public decimal DiscountAmount { get; set; }
    }
}
