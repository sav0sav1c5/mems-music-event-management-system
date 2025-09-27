using MusicEventManagementSystem.Models.Auth;

namespace MusicEventManagementSystem.API.Models
{
    public class Negotiation
    {
        public int NegotiationId { get; set; }
        public decimal ProposedFee { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        
        // Phase tracking
        public int CurrentPhaseOrder { get; set; } = 1; // Default to first phase

        // Foreign Keys
        public int EventId { get; set; }
        public int PerformerId { get; set; }

        // Navigation Properties
        public Event Event { get; set; } = null!;
        public Performer Performer { get; set; } = null!;
        public Communication Communication { get; set; } = null!;
        
        // One-to-Many relationships
        public ICollection<Document> Documents { get; set; } = new List<Document>();
        
        // Many-to-Many relationship with Users
        public ICollection<NegotiationUser> Users { get; set; } = new List<NegotiationUser>();
        
        // Many-to-Many relationship with Phases through NegotiationPhase
        public ICollection<NegotiationPhase> NegotiationPhases { get; set; } = new List<NegotiationPhase>();
        
        // One-to-Many relationship with requirement fulfillments
        public ICollection<NegotiationRequirementFulfillment> RequirementFulfillments { get; set; } = new List<NegotiationRequirementFulfillment>();
    }
}
