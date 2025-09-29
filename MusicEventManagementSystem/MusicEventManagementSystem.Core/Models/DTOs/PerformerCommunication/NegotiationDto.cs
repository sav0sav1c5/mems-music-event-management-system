namespace MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication
{
    public class NegotiationDto
    {
        public int NegotiationId { get; set; }
        public decimal ProposedFee { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        
        // Related entities
        public int EventId { get; set; }
        public string? EventName { get; set; }
        public int PerformerId { get; set; }
        public string? PerformerName { get; set; }
        
        // Related collections (basic info)
        public List<PhaseDto>? Phases { get; set; }
        public List<DocumentDto>? Documents { get; set; }
        public CommunicationDto? Communication { get; set; }
    }

    public class CreateNegotiationDto
    {
        public decimal ProposedFee { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        
        // Required foreign keys for creation
        public int EventId { get; set; }
        public int PerformerId { get; set; }
    }

    public class UpdateNegotiationDto
    {
        public decimal ProposedFee { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        
        // Allow updating foreign keys
        public int EventId { get; set; }
        public int PerformerId { get; set; }
    }

    public class NegotiationWithDetailsDto : NegotiationDto
    {
        // Extended version with full related entity details
        // public EventDto? Event { get; set; }  // TODO: Create EventDto
        public PerformerResponseDto? Performer { get; set; }
        public List<string>? UserEmails { get; set; } // For many-to-many with users
    }
}
