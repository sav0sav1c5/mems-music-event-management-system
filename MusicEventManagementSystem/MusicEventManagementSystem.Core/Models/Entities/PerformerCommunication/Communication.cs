namespace MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication
{
    public class Communication
    {
        public int CommunicationId { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Direction { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }
        public DateTime? RepliedAt { get; set; }

        // Foreign Key (Communication is dependent on Negotiation)
        public int NegotiationId { get; set; }

        // Navigation Property
        public Negotiation Negotiation { get; set; } = null!;
    }
}
