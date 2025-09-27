namespace MusicEventManagementSystem.API.Models
{
    public class NegotiationRequirementFulfillment
    {
        public int FulfillmentId { get; set; }
        
        // Foreign Keys
        public int NegotiationId { get; set; }
        public int PhaseId { get; set; }
        public int RequirementId { get; set; }
        
        // Fulfillment tracking
        public bool IsFulfilled { get; set; } = false;
        public string? Evidence { get; set; } // Optional evidence/notes
        public string? Notes { get; set; } // Additional notes
        public DateTime? FulfilledDate { get; set; }
        public string? FulfilledBy { get; set; } // User who marked as fulfilled
        
        // Navigation Properties
        public Negotiation Negotiation { get; set; } = null!;
        public Phase Phase { get; set; } = null!;
        public Requirement Requirement { get; set; } = null!;
        public NegotiationPhase NegotiationPhase { get; set; } = null!;
    }
}