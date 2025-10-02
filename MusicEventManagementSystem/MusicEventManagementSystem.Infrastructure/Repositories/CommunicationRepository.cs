using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication;
using MusicEventManagementSystem.Infrastructure.Database;

namespace MusicEventManagementSystem.Infrastructure.Repositories
{
    public class CommunicationRepository : Repository<Communication>, ICommunicationRepository
    {
        public CommunicationRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
