using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.API.Services.IService;
using MusicEventManagementSystem.API.DTOs;

namespace MusicEventManagementSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;
        private readonly ILogger<AnalyticsController> _logger;

        public AnalyticsController(IAnalyticsService analyticsService, ILogger<AnalyticsController> logger)
        {
            _analyticsService = analyticsService;
            _logger = logger;
        }

        /// <summary>
        /// Get overall analytics overview
        /// </summary>
        [HttpGet("overview")]
        public async Task<ActionResult<AnalyticsOverviewDto>> GetAnalyticsOverview([FromQuery] AnalyticsFilterDto? filter = null)
        {
            try
            {
                var overview = await _analyticsService.GetAnalyticsOverviewAsync(filter);
                return Ok(overview);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting analytics overview");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get workflow state analytics including phase distribution and performance
        /// </summary>
        [HttpGet("workflow-states")]
        public async Task<ActionResult<WorkflowStateAnalyticsDto>> GetWorkflowStateAnalytics([FromQuery] AnalyticsFilterDto? filter = null)
        {
            try
            {
                var workflowAnalytics = await _analyticsService.GetWorkflowStateAnalyticsAsync(filter);
                return Ok(workflowAnalytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting workflow state analytics");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get phase distribution across all negotiations
        /// </summary>
        [HttpGet("phase-distribution")]
        public async Task<ActionResult<List<PhaseDistributionDto>>> GetPhaseDistribution([FromQuery] AnalyticsFilterDto? filter = null)
        {
            try
            {
                var distribution = await _analyticsService.GetPhaseDistributionAsync(filter);
                return Ok(distribution);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting phase distribution");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get phase performance metrics
        /// </summary>
        [HttpGet("phase-performance")]
        public async Task<ActionResult<List<PhasePerformanceDto>>> GetPhasePerformance([FromQuery] AnalyticsFilterDto? filter = null)
        {
            try
            {
                var performance = await _analyticsService.GetPhasePerformanceAsync(filter);
                return Ok(performance);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting phase performance");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get time-based analytics including trends and metrics
        /// </summary>
        [HttpGet("time-based")]
        public async Task<ActionResult<TimeBasedAnalyticsDto>> GetTimeBasedAnalytics([FromQuery] AnalyticsFilterDto filter)
        {
            try
            {
                // Ensure we have default dates if not provided
                if (!filter.StartDate.HasValue)
                    filter.StartDate = DateTime.UtcNow.AddMonths(-6);
                if (!filter.EndDate.HasValue)
                    filter.EndDate = DateTime.UtcNow;
                if (string.IsNullOrEmpty(filter.GroupBy))
                    filter.GroupBy = "day";

                var timeAnalytics = await _analyticsService.GetTimeBasedAnalyticsAsync(filter);
                return Ok(timeAnalytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting time-based analytics");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get negotiation trends over time
        /// </summary>
        [HttpGet("trends")]
        public async Task<ActionResult<List<NegotiationTrendDto>>> GetNegotiationTrends([FromQuery] AnalyticsFilterDto filter)
        {
            try
            {
                // Set defaults if not provided
                if (!filter.StartDate.HasValue)
                    filter.StartDate = DateTime.UtcNow.AddMonths(-3);
                if (!filter.EndDate.HasValue)
                    filter.EndDate = DateTime.UtcNow;
                if (string.IsNullOrEmpty(filter.GroupBy))
                    filter.GroupBy = "week";

                var trends = await _analyticsService.GetNegotiationTrendsAsync(filter);
                return Ok(trends);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting negotiation trends");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get workflow transitions between phases
        /// </summary>
        [HttpGet("workflow-transitions")]
        public async Task<ActionResult<List<WorkflowTransitionDto>>> GetWorkflowTransitions([FromQuery] AnalyticsFilterDto filter)
        {
            try
            {
                // Set defaults if not provided
                if (!filter.StartDate.HasValue)
                    filter.StartDate = DateTime.UtcNow.AddMonths(-3);
                if (!filter.EndDate.HasValue)
                    filter.EndDate = DateTime.UtcNow;

                var transitions = await _analyticsService.GetWorkflowTransitionsAsync(filter);
                return Ok(transitions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting workflow transitions");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get performer analytics including performance by performer and genre
        /// </summary>
        [HttpGet("performers")]
        public async Task<ActionResult<PerformerAnalyticsDto>> GetPerformerAnalytics([FromQuery] AnalyticsFilterDto? filter = null)
        {
            try
            {
                var performerAnalytics = await _analyticsService.GetPerformerAnalyticsAsync(filter);
                return Ok(performerAnalytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting performer analytics");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get performance metrics over time
        /// </summary>
        [HttpGet("performance-metrics")]
        public async Task<ActionResult<List<PerformanceMetricDto>>> GetPerformanceMetrics([FromQuery] AnalyticsFilterDto filter)
        {
            try
            {
                // Set defaults if not provided
                if (!filter.StartDate.HasValue)
                    filter.StartDate = DateTime.UtcNow.AddMonths(-3);
                if (!filter.EndDate.HasValue)
                    filter.EndDate = DateTime.UtcNow;
                if (string.IsNullOrEmpty(filter.GroupBy))
                    filter.GroupBy = "week";

                var metrics = await _analyticsService.GetPerformanceMetricsAsync(filter);
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting performance metrics");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get completion rates by phase over time
        /// </summary>
        [HttpGet("completion-rates")]
        public async Task<ActionResult<List<CompletionRateDto>>> GetCompletionRates([FromQuery] AnalyticsFilterDto filter)
        {
            try
            {
                // Set defaults if not provided
                if (!filter.StartDate.HasValue)
                    filter.StartDate = DateTime.UtcNow.AddMonths(-3);
                if (!filter.EndDate.HasValue)
                    filter.EndDate = DateTime.UtcNow;
                if (string.IsNullOrEmpty(filter.GroupBy))
                    filter.GroupBy = "week";

                var completionRates = await _analyticsService.GetCompletionRatesAsync(filter);
                return Ok(completionRates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting completion rates");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get live analytics for real-time dashboard
        /// </summary>
        [HttpGet("live")]
        public async Task<ActionResult<LiveAnalyticsDto>> GetLiveAnalytics()
        {
            try
            {
                var liveAnalytics = await _analyticsService.GetLiveAnalyticsAsync();
                return Ok(liveAnalytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting live analytics");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get recent activities for activity feed
        /// </summary>
        [HttpGet("recent-activities")]
        public async Task<ActionResult<List<RecentActivityDto>>> GetRecentActivities([FromQuery] int limit = 10)
        {
            try
            {
                if (limit <= 0 || limit > 100)
                    limit = 10;

                var activities = await _analyticsService.GetRecentActivitiesAsync(limit);
                return Ok(activities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent activities");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get analytics for a specific performer
        /// </summary>
        [HttpGet("performer/{performerId}")]
        public async Task<ActionResult<PerformerAnalyticsDto>> GetPerformerSpecificAnalytics(int performerId, [FromQuery] AnalyticsFilterDto? filter = null)
        {
            try
            {
                // Create filter for specific performer if not provided
                if (filter == null)
                    filter = new AnalyticsFilterDto();

                filter.PerformerIds = new List<int> { performerId };

                var performerAnalytics = await _analyticsService.GetPerformerAnalyticsAsync(filter);
                return Ok(performerAnalytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting performer specific analytics for performer {PerformerId}", performerId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get analytics for a specific event
        /// </summary>
        [HttpGet("event/{eventId}")]
        public async Task<ActionResult<AnalyticsOverviewDto>> GetEventSpecificAnalytics(int eventId, [FromQuery] AnalyticsFilterDto? filter = null)
        {
            try
            {
                // Create filter for specific event if not provided
                if (filter == null)
                    filter = new AnalyticsFilterDto();

                filter.EventIds = new List<int> { eventId };

                var eventAnalytics = await _analyticsService.GetAnalyticsOverviewAsync(filter);
                return Ok(eventAnalytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting event specific analytics for event {EventId}", eventId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get analytics summary for dashboard cards
        /// </summary>
        [HttpGet("dashboard-summary")]
        public async Task<ActionResult<object>> GetDashboardSummary([FromQuery] AnalyticsFilterDto? filter = null)
        {
            try
            {
                var overview = await _analyticsService.GetAnalyticsOverviewAsync(filter);
                var liveAnalytics = await _analyticsService.GetLiveAnalyticsAsync();
                var phaseDistribution = await _analyticsService.GetPhaseDistributionAsync(filter);

                var summary = new
                {
                    TotalNegotiations = overview.TotalNegotiations,
                    ActiveNegotiations = overview.ActiveNegotiations,
                    CompletedNegotiations = overview.CompletedNegotiations,
                    TodayStarted = liveAnalytics.TodayStarted,
                    TodayCompleted = liveAnalytics.TodayCompleted,
                    AverageCompletionRate = overview.AverageCompletionRate,
                    AverageDuration = overview.AverageNegotiationDuration,
                    TotalProposedValue = overview.TotalProposedValue,
                    CurrentPhaseDistribution = phaseDistribution.Take(5).ToList(), // Top 5 phases
                    LastUpdated = DateTime.UtcNow
                };

                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dashboard summary");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}