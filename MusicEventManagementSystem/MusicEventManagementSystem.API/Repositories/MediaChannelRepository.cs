using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.Data;

namespace MusicEventManagementSystem.API.Repositories
{
    public class MediaChannelRepository : Repository<MediaChannel>, IMediaChannelRepository
    {
        public MediaChannelRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}