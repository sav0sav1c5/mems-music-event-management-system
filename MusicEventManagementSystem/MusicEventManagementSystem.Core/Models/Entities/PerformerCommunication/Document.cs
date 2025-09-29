namespace MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication
{
    public class Document
    {
        public int DocumentId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Path { get; set; } = string.Empty;
        public string Version { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }

        // Foreign Key
        public int NegotiationId { get; set; }

        // Navigation Property
        public Negotiation Negotiation { get; set; } = null!;
    }
}
