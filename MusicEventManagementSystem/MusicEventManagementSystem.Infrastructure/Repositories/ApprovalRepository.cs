using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Models.Entities.MediaCampaign;
using MusicEventManagementSystem.Infrastructure.Database;

namespace MusicEventManagementSystem.Infrastructure.Repositories
{
    public class ApprovalRepository : Repository<Approval>, IApprovalRepository
    {
        public ApprovalRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}