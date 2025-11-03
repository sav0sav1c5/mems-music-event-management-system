using MusicEventManagementSystem.API.DTOs;

namespace MusicEventManagementSystem.API.Services.IService
{
    public interface IAnalyticsService
    {
        // Overview analytics
        Task<AnalyticsOverviewDto> GetAnalyticsOverviewAsync(AnalyticsFilterDto? filter = null);
        
        // Workflow states analysis
        Task<WorkflowStateAnalyticsDto> GetWorkflowStateAnalyticsAsync(AnalyticsFilterDto? filter = null);
        
        // Time-based analytics
        Task<TimeBasedAnalyticsDto> GetTimeBasedAnalyticsAsync(AnalyticsFilterDto filter);
        
        // Performer analytics
        Task<PerformerAnalyticsDto> GetPerformerAnalyticsAsync(AnalyticsFilterDto? filter = null);
        
        // Live/real-time analytics
        Task<LiveAnalyticsDto> GetLiveAnalyticsAsync();
        
        // Phase-specific analytics
        Task<List<PhaseDistributionDto>> GetPhaseDistributionAsync(AnalyticsFilterDto? filter = null);
        Task<List<PhasePerformanceDto>> GetPhasePerformanceAsync(AnalyticsFilterDto? filter = null);
        
        // Trend analysis
        Task<List<NegotiationTrendDto>> GetNegotiationTrendsAsync(AnalyticsFilterDto filter);
        Task<List<WorkflowTransitionDto>> GetWorkflowTransitionsAsync(AnalyticsFilterDto filter);
        
        // Performance metrics
        Task<List<PerformanceMetricDto>> GetPerformanceMetricsAsync(AnalyticsFilterDto filter);
        Task<List<CompletionRateDto>> GetCompletionRatesAsync(AnalyticsFilterDto filter);
        
        // Recent activity for live updates
        Task<List<RecentActivityDto>> GetRecentActivitiesAsync(int limit = 10);
    }
}