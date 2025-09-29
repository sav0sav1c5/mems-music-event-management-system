using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Models.Entities.MediaCampaign;
using MusicEventManagementSystem.Infrastructure.Database;

namespace MusicEventManagementSystem.Infrastructure.Repositories
{
    public class MediaWorkflowRepository : Repository<MediaWorkflow>, IMediaWorkflowRepository
    {
        public MediaWorkflowRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}