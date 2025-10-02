namespace MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication
{
    public class RequirementDto
    {
        public int RequirementId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool Fulfilled { get; set; }
        public DateTime CreatedAt { get; set; }
        
        // Related entity
        public int PhaseId { get; set; }
        public string? PhaseName { get; set; }
    }

    public class CreateRequirementDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool Fulfilled { get; set; }
        
        // Required foreign key
        public int PhaseId { get; set; }
    }

    public class UpdateRequirementDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool Fulfilled { get; set; }
        
        // Allow updating foreign key
        public int PhaseId { get; set; }
    }
}
