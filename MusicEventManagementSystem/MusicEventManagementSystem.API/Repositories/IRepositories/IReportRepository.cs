using MusicEventManagementSystem.API.DTOs;

namespace MusicEventManagementSystem.API.Repositories.IRepositories
{
    public interface IReportRepository
    {
        Task<IEnumerable<EventNegotiationSummaryDto>> GetEventNegotiationsReportAsync();
        Task<IEnumerable<PerformerPhaseStatsDto>> GetPerformerPhaseReportAsync();
    }
}
