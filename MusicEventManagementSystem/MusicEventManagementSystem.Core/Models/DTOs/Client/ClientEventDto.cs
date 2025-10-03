using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MusicEventManagementSystem.Core.Models.DTOs.Client
{
    public class ClientEventDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? Status { get; set; }
        public string? LocationName { get; set; }
        public decimal MinPrice { get; set; }
        public decimal MaxPrice { get; set; }
        public int TotalCapacity { get; set; }
        public int AvailableTickets { get; set; }
        public List<string>? PerformerNames { get; set; }
        public List<string>? VenueNames { get; set; }
        public string? ImageUrl { get; set; }
    }
}
