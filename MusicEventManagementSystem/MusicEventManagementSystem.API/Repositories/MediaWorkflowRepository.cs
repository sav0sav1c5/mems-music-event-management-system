using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.Data;

namespace MusicEventManagementSystem.API.Repositories
{
    public class MediaWorkflowRepository : Repository<MediaWorkflow>, IMediaWorkflowRepository
    {
        public MediaWorkflowRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}