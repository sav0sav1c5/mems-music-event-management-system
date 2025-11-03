using MusicEventManagementSystem.API.Models;

namespace MusicEventManagementSystem.API.Repositories.IRepositories
{
    public interface INegotiationRepository : IRepository<Negotiation>
    {
        Task<Negotiation?> GetNegotiationWithDetailsAsync(int id);
        Task<IEnumerable<Negotiation>> GetNegotiationsWithBasicDetailsAsync();
        Task<IEnumerable<Negotiation>> GetNegotiationsByEventIdAsync(int eventId);
        Task<IEnumerable<Negotiation>> GetNegotiationsByPerformerIdAsync(int performerId);
        Task<bool> AddUserToNegotiationAsync(int negotiationId, string userId);
        Task<bool> RemoveUserFromNegotiationAsync(int negotiationId, string userId);
        Task<IEnumerable<string>> GetNegotiationUserEmailsAsync(int negotiationId);
        
        // Analytics methods
        Task<IQueryable<Negotiation>> GetAllWithIncludesAsync();
        Task<IEnumerable<Negotiation>> GetRecentNegotiationsAsync(int count);
    }
}
