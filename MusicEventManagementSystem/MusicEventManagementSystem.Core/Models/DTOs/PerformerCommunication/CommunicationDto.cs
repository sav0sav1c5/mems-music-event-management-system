namespace MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication
{
    public class CommunicationDto
    {
        public int CommunicationId { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Direction { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }
        public DateTime? RepliedAt { get; set; }
        
        // Related entity
        public int NegotiationId { get; set; }
    }

    public class CreateCommunicationDto
    {
        public string Type { get; set; } = string.Empty;
        public string Direction { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        
        // Required foreign key
        public int NegotiationId { get; set; }
    }

    public class UpdateCommunicationDto
    {
        public string Type { get; set; } = string.Empty;
        public string Direction { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        
        // Allow updating foreign key
        public int NegotiationId { get; set; }
    }
}
