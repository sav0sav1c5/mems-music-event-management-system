namespace MusicEventManagementSystem.API.Models
{
    public class NegotiationPhase
    {
        // Composite key properties
        public int NegotiationId { get; set; }
        public int PhaseId { get; set; }

        // Status and tracking properties
        public string Status { get; set; } = "NotStarted"; // NotStarted, InProgress, Completed
        public DateTime? StartDate { get; set; }
        public DateTime? CompletedDate { get; set; }
        public bool IsActive { get; set; } = false; // Only one phase should be active per negotiation
        
        // Navigation Properties
        public Negotiation Negotiation { get; set; } = null!;
        public Phase Phase { get; set; } = null!;
        
        // One-to-Many relationship with requirement fulfillments
        public ICollection<NegotiationRequirementFulfillment> RequirementFulfillments { get; set; } = new List<NegotiationRequirementFulfillment>();
    }
}