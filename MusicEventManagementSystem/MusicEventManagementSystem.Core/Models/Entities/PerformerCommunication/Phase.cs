namespace MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication
{
    public class Phase
    {
        public int PhaseId { get; set; }
        public string PhaseName { get; set; } = string.Empty;
        public int OrderNumber { get; set; }
        public TimeSpan EstimatedDuration { get; set; }

        // Foreign Keys
        public int NegotiationId { get; set; }
        public int? ContractId { get; set; } // Nullable - not every Phase has a Contract

        // Navigation Properties
        public Negotiation Negotiation { get; set; } = null!;
        public Contract? Contract { get; set; }
        
        // One-to-Many relationship
        public ICollection<Requirement> Requirements { get; set; } = new List<Requirement>();
    }
}
