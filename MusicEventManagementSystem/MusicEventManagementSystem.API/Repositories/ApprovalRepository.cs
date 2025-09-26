using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.Data;

namespace MusicEventManagementSystem.API.Repositories
{
    public class ApprovalRepository : Repository<Approval>, IApprovalRepository
    {
        public ApprovalRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}