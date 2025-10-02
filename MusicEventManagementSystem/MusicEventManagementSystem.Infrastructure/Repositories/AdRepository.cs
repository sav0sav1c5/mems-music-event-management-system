using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Models.Entities.MediaCampaign;
using MusicEventManagementSystem.Infrastructure.Database;

namespace MusicEventManagementSystem.Infrastructure.Repositories
{
    public class AdRepository : Repository<Ad>, IAdRepository
    {
        public AdRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}