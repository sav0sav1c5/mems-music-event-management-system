using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MusicEventManagementSystem.Core.Models.DTOs.TicketSales
{
    public class RevenueAnalysisDto
    {
        public decimal TotalRevenue { get; set; }
        public int TotalSales { get; set; }
        public decimal AverageSaleAmount { get; set; }
        public DateTime PeriodStart { get; set; }
        public DateTime PeriodEnd { get; set; }
    }
}
