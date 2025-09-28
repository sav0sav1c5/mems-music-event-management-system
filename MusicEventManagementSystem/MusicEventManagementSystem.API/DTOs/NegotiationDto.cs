namespace MusicEventManagementSystem.API.DTOs
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
        public PerformerDto? Performer { get; set; }
        public List<string>? UserEmails { get; set; } // For many-to-many with users
    }

    public class NegotiationPhaseDto
    {
        public int NegotiationId { get; set; }
        public int PhaseId { get; set; }
        public string PhaseName { get; set; } = string.Empty;
        public string? PhaseDescription { get; set; }
        public int OrderNumber { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? StartDate { get; set; }
        public DateTime? CompletedDate { get; set; }
        public bool IsActive { get; set; }
        public decimal CompletionPercentage { get; set; }
        public int FulfilledRequirementsCount { get; set; }
        public int TotalRequirementsCount { get; set; }
        public List<NegotiationRequirementFulfillmentDto>? RequirementFulfillments { get; set; }
    }

    public class NegotiationRequirementFulfillmentDto
    {
        public int FulfillmentId { get; set; }
        public int NegotiationId { get; set; }
        public int PhaseId { get; set; }
        public int RequirementId { get; set; }
        public string RequirementTitle { get; set; } = string.Empty;
        public string RequirementDescription { get; set; } = string.Empty;
        public bool IsRequired { get; set; }
        public bool IsFulfilled { get; set; }
        public string? Evidence { get; set; }
        public string? Notes { get; set; }
        public DateTime? FulfilledDate { get; set; }
        public string? FulfilledBy { get; set; }
    }

    public class NegotiationWorkflowDto
    {
        public int NegotiationId { get; set; }
        public decimal ProposedFee { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int CurrentPhaseOrder { get; set; }
        
        // Related entities
        public int EventId { get; set; }
        public string? EventName { get; set; }
        public int PerformerId { get; set; }
        public string? PerformerName { get; set; }
        
        // Workflow data
        public List<NegotiationPhaseDto> Phases { get; set; } = new List<NegotiationPhaseDto>();
        public NegotiationPhaseDto? CurrentPhase { get; set; }
        public CommunicationDto? Communication { get; set; }
        public bool CanAdvanceToNextPhase { get; set; }
        public decimal OverallCompletionPercentage { get; set; }
    }

    public class FulfillRequirementDto
    {
        public bool IsFulfilled { get; set; }
        public string? FulfilledBy { get; set; }
        public string? Notes { get; set; }
        public string? Evidence { get; set; }
    }

    public class AddCommunicationDto
    {
        public string Type { get; set; } = string.Empty;
        public string Direction { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
    }
}
