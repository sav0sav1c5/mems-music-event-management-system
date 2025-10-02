using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Models.Entities.MediaCampaign;
using MusicEventManagementSystem.Infrastructure.Database;

namespace MusicEventManagementSystem.Infrastructure.Repositories
{
    public class MediaVersionRepository : Repository<MediaVersion>, IMediaVersionRepository
    {
        public MediaVersionRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}