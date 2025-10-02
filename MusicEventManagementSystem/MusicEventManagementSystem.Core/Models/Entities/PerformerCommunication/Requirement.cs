namespace MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication
{
    public class Requirement
    {
        public int RequirementId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool Fulfilled { get; set; }
        public DateTime CreatedAt { get; set; }

        // Foreign Key
        public int PhaseId { get; set; }

        // Navigation Property
        public Phase Phase { get; set; } = null!;
    }
}
