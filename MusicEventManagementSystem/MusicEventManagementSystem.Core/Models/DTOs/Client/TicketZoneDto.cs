using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MusicEventManagementSystem.Core.Models.DTOs.Client
{
    public class TicketZoneDto
    {
        public int ZoneId { get; set; }
        public string? ZoneName { get; set; }
        public string? ZoneDescription { get; set; }
        public string? Position { get; set; }
        public List<TicketTypeInfoDto>? TicketTypes { get; set; }
    }
}
