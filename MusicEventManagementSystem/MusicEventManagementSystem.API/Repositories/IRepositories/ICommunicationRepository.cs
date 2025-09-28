using MusicEventManagementSystem.API.Models;

namespace MusicEventManagementSystem.API.Repositories.IRepositories
{
    public interface ICommunicationRepository : IRepository<Communication>
    {
        Task<Communication?> GetByNegotiationIdAsync(int negotiationId);
    }
}
