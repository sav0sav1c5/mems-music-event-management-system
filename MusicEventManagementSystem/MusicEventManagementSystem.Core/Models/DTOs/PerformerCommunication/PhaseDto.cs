namespace MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication
{
    public class PhaseDto
    {
        public int PhaseId { get; set; }
        public string PhaseName { get; set; } = string.Empty;
        public int OrderNumber { get; set; }
        public TimeSpan EstimatedDuration { get; set; }
        
        // Related entities
        public int NegotiationId { get; set; }
        public int? ContractId { get; set; }
        
        // Related collections
        public List<RequirementDto>? Requirements { get; set; }
    }

    public class CreatePhaseDto
    {
        public string PhaseName { get; set; } = string.Empty;
        public int OrderNumber { get; set; }
        public TimeSpan EstimatedDuration { get; set; }
        
        // Required foreign key
        public int NegotiationId { get; set; }
        public int? ContractId { get; set; }
    }

    public class UpdatePhaseDto
    {
        public string PhaseName { get; set; } = string.Empty;
        public int OrderNumber { get; set; }
        public TimeSpan EstimatedDuration { get; set; }
        
        // Allow updating foreign keys
        public int NegotiationId { get; set; }
        public int? ContractId { get; set; }
    }

    public class PhaseWithDetailsDto : PhaseDto
    {
        // Extended version with full related entity details
        public ContractDto? Contract { get; set; }
    }
}
