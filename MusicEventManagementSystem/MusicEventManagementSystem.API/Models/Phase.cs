using System.Text.Json.Serialization;

namespace MusicEventManagementSystem.API.Models
{
    public class Phase
    {
        public int PhaseId { get; set; }
        public string PhaseName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int OrderNumber { get; set; }
        public int EstimatedDuration { get; set; } // Duration in days
        public bool IsGlobal { get; set; } = true; // Indicates this is a global template phase

        // Global phase - no longer tied to specific negotiation
        // One-to-Many relationship with global requirements
        [JsonIgnore]
        public ICollection<Requirement> Requirements { get; set; } = new List<Requirement>();
        
        // Many-to-Many relationship with negotiations through NegotiationPhase
        [JsonIgnore]
        public ICollection<NegotiationPhase> NegotiationPhases { get; set; } = new List<NegotiationPhase>();
    }
}
