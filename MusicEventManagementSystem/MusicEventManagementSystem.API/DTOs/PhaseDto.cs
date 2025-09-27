namespace MusicEventManagementSystem.API.DTOs
{
    public class PhaseDto
    {
        public int PhaseId { get; set; }
        public string PhaseName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int OrderNumber { get; set; }
        public int EstimatedDuration { get; set; } // Duration in days
        public bool IsGlobal { get; set; } = true;
    }

    public class CreatePhaseDto
    {
        public string PhaseName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int OrderNumber { get; set; }
        public int EstimatedDuration { get; set; } // Duration in days
        public bool IsGlobal { get; set; } = true;
    }

    public class UpdatePhaseDto
    {
        public string PhaseName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int OrderNumber { get; set; }
        public int EstimatedDuration { get; set; } // Duration in days
        public bool IsGlobal { get; set; } = true;
    }

    public class PhaseWithRequirementsDto : PhaseDto
    {
        // Extended version with requirements but no circular references
        public List<RequirementDto>? Requirements { get; set; }
    }
}
