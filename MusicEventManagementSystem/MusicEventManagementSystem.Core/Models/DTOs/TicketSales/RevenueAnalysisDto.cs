using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
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

    public class SalesAnalysisResult
    {
        public string AnalysisSection { get; set; }
        public string MetricName { get; set; }
        public decimal MetricValue { get; set; }
        public string MetricUnit { get; set; }
        public JsonDocument AdditionalInfo { get; set; }
    }

    public class AnalysisReport
    {
        public DateTime GeneratedAt { get; set; }
        public int? EventId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public Dictionary<string, List<SalesAnalysisResult>> Sections { get; set; }
        public AnalysisSummary Summary { get; set; }
    }

    public class AnalysisSummary
    {
        public decimal TotalRevenue { get; set; }
        public int TotalTicketsSold { get; set; }
        public decimal AverageTicketPrice { get; set; }
        public string TopPerformingZone { get; set; }
        public string TopPerformingOffer { get; set; }
        public List<string> Recommendations { get; set; }
    }
}
