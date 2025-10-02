using MusicEventManagementSystem.Core.Models.Entities.Auth;

namespace MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication
{
    public class NegotiationUser
    {
        public int NegotiationId { get; set; }
        public string UserId { get; set; } = string.Empty;

        // Navigation Properties
        public Negotiation Negotiation { get; set; } = null!;
        public ApplicationUser User { get; set; } = null!;
    }
}