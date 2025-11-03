using MusicEventManagementSystem.API.DTOs;

namespace MusicEventManagementSystem.API.Services.IService
{
    public interface IPdfReportService
    {
        Task<byte[]> GenerateAnalyticsReportAsync(AnalyticsFilterDto? filter = null);
        Task<byte[]> GeneratePerformerReportAsync(int? performerId = null, AnalyticsFilterDto? filter = null);
        Task<byte[]> GenerateEventReportAsync(int? eventId = null, AnalyticsFilterDto? filter = null);
        Task<byte[]> GenerateDashboardReportAsync(AnalyticsFilterDto? filter = null);
    }
}