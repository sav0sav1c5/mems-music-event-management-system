using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.Data;

namespace MusicEventManagementSystem.API.Repositories
{
    public class AdRepository : Repository<Ad>, IAdRepository
    {
        public AdRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}