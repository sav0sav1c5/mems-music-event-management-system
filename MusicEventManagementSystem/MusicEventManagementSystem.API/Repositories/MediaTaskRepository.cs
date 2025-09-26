using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.Data;

namespace MusicEventManagementSystem.API.Repositories
{
    public class MediaTaskRepository : Repository<MediaTask>, IMediaTaskRepository
    {
        public MediaTaskRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
