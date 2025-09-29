using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication;
using MusicEventManagementSystem.Infrastructure.Database;

namespace MusicEventManagementSystem.Infrastructure.Repositories
{
    public class RequirementRepository : Repository<Requirement>, IRequirementRepository
    {
        public RequirementRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
