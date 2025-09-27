namespace MusicEventManagementSystem.API.DTOs
{
    public class RequirementDto
    {
        public int RequirementId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsRequired { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int PhaseId { get; set; }
    }

    public class CreateRequirementDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsRequired { get; set; } = true;
        
        // Required foreign key
        public int PhaseId { get; set; }
    }

    public class UpdateRequirementDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsRequired { get; set; } = true;
        
        // Allow updating foreign key
        public int PhaseId { get; set; }
    }
}
