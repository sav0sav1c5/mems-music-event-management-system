using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Models.Entities.MediaCampaign;
using MusicEventManagementSystem.Infrastructure.Database;

namespace MusicEventManagementSystem.Infrastructure.Repositories
{
    public class MediaTaskRepository : Repository<MediaTask>, IMediaTaskRepository
    {
        public MediaTaskRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
