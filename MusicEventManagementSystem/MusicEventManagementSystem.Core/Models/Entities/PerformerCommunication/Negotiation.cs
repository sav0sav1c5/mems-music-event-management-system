using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication
{
    public class Negotiation
    {
        public int NegotiationId { get; set; }
        public decimal ProposedFee { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        // Foreign Keys
        public int EventId { get; set; }
        public int PerformerId { get; set; }

        // Navigation Properties
        public Event Event { get; set; } = null!;
        public Performer Performer { get; set; } = null!;
        public Communication Communication { get; set; } = null!;
        
        // One-to-Many relationships
        public ICollection<Phase> Phases { get; set; } = new List<Phase>();
        public ICollection<Document> Documents { get; set; } = new List<Document>();
        
        // Many-to-Many relationship with Users
        public ICollection<NegotiationUser> Users { get; set; } = new List<NegotiationUser>();
    }
}
