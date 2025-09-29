using MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication;

namespace MusicEventManagementSystem.Core.Models.Entities.EventOrganization
{
    public class Performer
    {
        public int PerformerId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Contact { get; set; }
        public string Genre { get; set; } = string.Empty;
        public int Popularity { get; set; }
        public string TechnicalRequirements { get; set; } = string.Empty;
        public decimal MinPrice { get; set; }
        public decimal MaxPrice { get; set; }
        public TimeSpan AverageResponseTime { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }

        // Navigation Properties
        public Negotiation? Negotiation { get; set; } // One-to-One relationship
        public ICollection<Contract> Contracts { get; set; } = new List<Contract>();
    }

}
