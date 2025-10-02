using Microsoft.EntityFrameworkCore;
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.Data;

namespace MusicEventManagementSystem.API.Repositories
{
    public class ContractRepository : Repository<Contract>, IContractRepository
    {
        public ContractRepository(ApplicationDbContext context) : base(context)
        {
        }

        public override async Task<Contract?> GetByIdAsync(int id)
        {
            return await _dbSet
                .Include(c => c.Performer) // Include performer data
                .Include(c => c.Event!)    // Include event data
                    .ThenInclude(e => e.Location)
                .FirstOrDefaultAsync(c => c.ContractId == id);
        }

        public override async Task<IEnumerable<Contract>> GetAllAsync()
        {
            return await _dbSet
                .Include(c => c.Performer) // Include performer data
                .Include(c => c.Event!)    // Include event data
                    .ThenInclude(e => e.Location)
                .ToListAsync();
        }
    }
}
