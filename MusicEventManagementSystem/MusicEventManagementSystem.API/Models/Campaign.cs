// MusicEventManagementSystem.API/Models/Campaign.cs
namespace MusicEventManagementSystem.API.Models
{
    public class Campaign
    {
        public int CampaignId { get; set; }
        public int EventId { get; set; }
        public string Name { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal TotalBudget { get; set; }
    }
}