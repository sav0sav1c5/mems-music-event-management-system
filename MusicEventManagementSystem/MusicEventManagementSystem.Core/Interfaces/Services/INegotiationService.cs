using MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication;

namespace MusicEventManagementSystem.Core.Interfaces.Services
{
    public interface INegotiationService
    {
        Task<IEnumerable<Negotiation>> GetAllNegotiationsAsync();
        Task<Negotiation?> GetNegotiationByIdAsync(int id);
        Task<Negotiation> CreateNegotiationAsync(Negotiation negotiation);
        Task<Negotiation?> UpdateNegotiationAsync(int id, Negotiation negotiation);
        Task<bool> DeleteNegotiationAsync(int id);

        // New methods for handling relationships
        Task<NegotiationWithDetailsDto?> GetNegotiationWithDetailsAsync(int id);
        Task<IEnumerable<NegotiationDto>> GetNegotiationsWithBasicDetailsAsync();
        Task<IEnumerable<NegotiationDto>> GetNegotiationsByEventIdAsync(int eventId);
        Task<IEnumerable<NegotiationDto>> GetNegotiationsByPerformerIdAsync(int performerId);
        Task<bool> AddUserToNegotiationAsync(int negotiationId, string userId);
        Task<bool> RemoveUserFromNegotiationAsync(int negotiationId, string userId);
        Task<Negotiation> CreateNegotiationWithRelationshipsAsync(CreateNegotiationDto createDto);
        Task<Negotiation?> UpdateNegotiationWithRelationshipsAsync(int id, UpdateNegotiationDto updateDto);
    }
}
