using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MusicEventManagementSystem.Core.Models.DTOs.Client
{
    public class TicketTypeInfoDto
    {
        public int TicketTypeId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public decimal BasePrice { get; set; }
        public decimal CurrentPrice { get; set; }
        public int AvailableQuantity { get; set; }
        public string? Status { get; set; }
        public bool HasSpecialOffer { get; set; }
        public string? SpecialOfferDescription { get; set; }
        public decimal? DiscountPercentage { get; set; }
    }
}
