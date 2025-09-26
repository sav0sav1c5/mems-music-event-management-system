using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.Data;

namespace MusicEventManagementSystem.API.Repositories
{
    public class MediaVersionRepository : Repository<MediaVersion>, IMediaVersionRepository
    {
        public MediaVersionRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}