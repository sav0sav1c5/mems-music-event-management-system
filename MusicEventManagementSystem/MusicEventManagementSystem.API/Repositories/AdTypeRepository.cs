using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.Data;

namespace MusicEventManagementSystem.API.Repositories
{
    public class AdTypeRepository : Repository<AdType>, IAdTypeRepository
    {
        public AdTypeRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}