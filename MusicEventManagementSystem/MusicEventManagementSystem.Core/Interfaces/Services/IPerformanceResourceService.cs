<<<<<<< HEAD:MusicEventManagementSystem/MusicEventManagementSystem.API/Services/IService/IPerformanceResourceService.cs
using MusicEventManagementSystem.API.Models;
using System.Collections.Generic;
=======
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;
>>>>>>> fc7d1e8729b7d2d6668f9b466d7f35e20a9a6543:MusicEventManagementSystem/MusicEventManagementSystem.Core/Interfaces/Services/IPerformanceResourceService.cs

namespace MusicEventManagementSystem.Core.Interfaces.Services
{
    public interface IPerformanceResourceService
    {
        Task<IEnumerable<PerformanceResource>> GetAllPerformanceResourcesAsync();
        Task<PerformanceResource?> GetPerformanceResourceByIdAsync(int id);
        Task<IEnumerable<PerformanceResource>> GetPerformanceResourcesByPerformanceIdAsync(int performanceId);
        Task<PerformanceResource> CreatePerformanceResourceAsync(PerformanceResource performanceResource);
        Task<PerformanceResource?> UpdatePerformanceResourceAsync(int id, PerformanceResource performanceResource);
        Task<bool> DeletePerformanceResourceAsync(int id);
    }
}
