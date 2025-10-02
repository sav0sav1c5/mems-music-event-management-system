using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Models.Entities.MediaCampaign;
using MusicEventManagementSystem.Infrastructure.Database;

namespace MusicEventManagementSystem.Infrastructure.Repositories
{
    public class MediaChannelRepository : Repository<MediaChannel>, IMediaChannelRepository
    {
        public MediaChannelRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}