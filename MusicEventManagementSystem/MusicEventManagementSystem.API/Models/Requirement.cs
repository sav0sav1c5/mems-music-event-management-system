using System.Text.Json.Serialization;

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
        
        // Contract Update Trigger - specifies what contract field to update when this requirement is fulfilled
        public string? ContractUpdateAction { get; set; } = null;

        // Foreign Key
        public int PhaseId { get; set; }

        // Navigation Properties
        [JsonIgnore]
        public Phase Phase { get; set; } = null!;
        
        // One-to-Many relationship with fulfillments
        [JsonIgnore]
        public ICollection<NegotiationRequirementFulfillment> Fulfillments { get; set; } = new List<NegotiationRequirementFulfillment>();
    }
}
