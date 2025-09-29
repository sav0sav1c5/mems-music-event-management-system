using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Models.Entities.MediaCampaign;
using MusicEventManagementSystem.Infrastructure.Database;

namespace MusicEventManagementSystem.Infrastructure.Repositories
{
    public class AdTypeRepository : Repository<AdType>, IAdTypeRepository
    {
        public AdTypeRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}