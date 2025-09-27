namespace MusicEventManagementSystem.API.Models
{
    public class Requirement
    {
        public int RequirementId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsRequired { get; set; } = true; // Some requirements might be optional
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Foreign Key
        public int PhaseId { get; set; }

        // Navigation Properties
        public Phase Phase { get; set; } = null!;
        
        // One-to-Many relationship with fulfillments
        public ICollection<NegotiationRequirementFulfillment> Fulfillments { get; set; } = new List<NegotiationRequirementFulfillment>();
    }
}
