using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MusicEventManagementSystem.Core.Models.DTOs.Client
{
    public class CartItemDto
    {
        public int TicketTypeId { get; set; }
        public string? TicketTypeName { get; set; }
        public string? EventName { get; set; }
        public string? ZoneName { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Subtotal { get; set; }
        public int? SpecialOfferId { get; set; }
        public string? SpecialOfferName { get; set; }
        public decimal DiscountAmount { get; set; }
    }

    public class AddToCartDto
    {
        public int TicketTypeId { get; set; }
        public int Quantity { get; set; }
    }

    public class UpdateCartItemDto
    {
        public int TicketTypeId { get; set; }
        public int Quantity { get; set; }
    }

    public class CartDto
    {
        public List<CartItemDto> Items { get; set; } = new();
        public decimal Subtotal { get; set; }
        public decimal TotalDiscount { get; set; }
        public decimal Total { get; set; }
        public int TotalItems { get; set; }
    }
}
