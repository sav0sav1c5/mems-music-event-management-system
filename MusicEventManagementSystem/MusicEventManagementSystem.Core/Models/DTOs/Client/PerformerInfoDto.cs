using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MusicEventManagementSystem.Core.Models.DTOs.Client
{
    public class PerformerInfoDto
    {
        public int PerformerId { get; set; }
        public string? Name { get; set; }
        public string? Genre { get; set; }
        public DateTime? PerformanceStartTime { get; set; }
        public DateTime? PerformanceEndTime { get; set; }
    }
}
