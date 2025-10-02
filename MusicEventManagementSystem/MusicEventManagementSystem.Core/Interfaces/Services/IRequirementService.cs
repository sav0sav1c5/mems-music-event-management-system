using MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication;

namespace MusicEventManagementSystem.Core.Interfaces.Services
{
    public interface IRequirementService
    {
        Task<IEnumerable<Requirement>> GetAllRequirementsAsync();
        Task<Requirement?> GetRequirementByIdAsync(int id);
        Task<Requirement> CreateRequirementAsync(Requirement requirement);
        Task<Requirement?> UpdateRequirementAsync(int id, Requirement requirement);
        Task<bool> DeleteRequirementAsync(int id);
    }
}
