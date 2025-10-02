<<<<<<< HEAD:MusicEventManagementSystem/MusicEventManagementSystem.API/Repositories/IRepositories/IEventRepository.cs
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.Enums;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
=======
using MusicEventManagementSystem.Core.Enums.EventOrganization;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;
>>>>>>> fc7d1e8729b7d2d6668f9b466d7f35e20a9a6543:MusicEventManagementSystem/MusicEventManagementSystem.Core/Interfaces/Repositories/IEventRepository.cs

namespace MusicEventManagementSystem.Core.Interfaces.Repositories
{
    public interface IEventRepository : IRepository<Event>
    {
        Task<Event?> GetByNameAsync(string name);
        Task<IEnumerable<Event>> GetByStatusAsync(EventStatus status);
        Task<IEnumerable<Event>> GetByDateRangeAsync(DateTime start, DateTime end);
        Task<IEnumerable<Event>> GetByCreatedByIdAsync(string createdById);
    }
}
