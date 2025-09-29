namespace MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication
{
    public class DocumentDto
    {
        public int DocumentId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Path { get; set; } = string.Empty;
        public string Version { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
        
        // Related entity
        public int NegotiationId { get; set; }
    }

    public class CreateDocumentDto
    {
        public string Title { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Path { get; set; } = string.Empty;
        public string Version { get; set; } = string.Empty;
        
        // Required foreign key
        public int NegotiationId { get; set; }
    }

    public class UpdateDocumentDto
    {
        public string Title { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Path { get; set; } = string.Empty;
        public string Version { get; set; } = string.Empty;
        
        // Allow updating foreign key
        public int NegotiationId { get; set; }
    }
}
