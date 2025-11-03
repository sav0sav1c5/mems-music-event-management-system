namespace MusicEventManagementSystem.API.DTOs
{
    // Main analytics overview
    public class AnalyticsOverviewDto
    {
        public int TotalNegotiations { get; set; }
        public int ActiveNegotiations { get; set; }
        public int CompletedNegotiations { get; set; }
        public decimal AverageNegotiationDuration { get; set; } // In days
        public decimal AverageCompletionRate { get; set; } // Percentage
        public decimal TotalProposedValue { get; set; }
    }

    // Workflow states analysis
    public class WorkflowStateAnalyticsDto
    {
        public List<PhaseDistributionDto> PhaseDistribution { get; set; } = new();
        public List<PhasePerformanceDto> PhasePerformance { get; set; } = new();
        public List<WorkflowTransitionDto> WorkflowTransitions { get; set; } = new();
    }

    // Phase distribution data
    public class PhaseDistributionDto
    {
        public int PhaseId { get; set; }
        public string PhaseName { get; set; } = string.Empty;
        public int NegotiationCount { get; set; }
        public decimal Percentage { get; set; }
        public string Status { get; set; } = string.Empty; // NotStarted, InProgress, Completed
    }

    // Phase performance metrics
    public class PhasePerformanceDto
    {
        public int PhaseId { get; set; }
        public string PhaseName { get; set; } = string.Empty;
        public decimal AverageDuration { get; set; } // In days
        public decimal CompletionRate { get; set; } // Percentage
        public int TotalRequirements { get; set; }
        public int CompletedRequirements { get; set; }
        public decimal RequirementCompletionRate { get; set; }
    }

    // Workflow transitions over time
    public class WorkflowTransitionDto
    {
        public DateTime Date { get; set; }
        public int FromPhaseId { get; set; }
        public int ToPhaseId { get; set; }
        public string FromPhaseName { get; set; } = string.Empty;
        public string ToPhaseName { get; set; } = string.Empty;
        public int TransitionCount { get; set; }
    }

    // Time-based analytics
    public class TimeBasedAnalyticsDto
    {
        public List<NegotiationTrendDto> NegotiationTrends { get; set; } = new();
        public List<PerformanceMetricDto> PerformanceMetrics { get; set; } = new();
        public List<CompletionRateDto> CompletionRates { get; set; } = new();
    }

    public class NegotiationTrendDto
    {
        public DateTime Date { get; set; }
        public int StartedNegotiations { get; set; }
        public int CompletedNegotiations { get; set; }
        public int ActiveNegotiations { get; set; }
        public decimal AverageProposedFee { get; set; }
    }

    public class PerformanceMetricDto
    {
        public DateTime Date { get; set; }
        public decimal AverageNegotiationDuration { get; set; }
        public decimal AveragePhaseTransitionTime { get; set; }
        public decimal SuccessRate { get; set; }
    }

    public class CompletionRateDto
    {
        public DateTime Date { get; set; }
        public int PhaseId { get; set; }
        public string PhaseName { get; set; } = string.Empty;
        public decimal CompletionRate { get; set; }
        public int TotalNegotiations { get; set; }
        public int CompletedNegotiations { get; set; }
    }

    // Performer analytics
    public class PerformerAnalyticsDto
    {
        public List<PerformerPerformanceDto> PerformerPerformance { get; set; } = new();
        public List<GenreAnalyticsDto> GenreAnalytics { get; set; } = new();
    }

    public class PerformerPerformanceDto
    {
        public int PerformerId { get; set; }
        public string PerformerName { get; set; } = string.Empty;
        public string Genre { get; set; } = string.Empty;
        public int TotalNegotiations { get; set; }
        public int CompletedNegotiations { get; set; }
        public decimal SuccessRate { get; set; }
        public decimal AverageDuration { get; set; }
        public decimal AverageProposedFee { get; set; }
        public decimal AverageResponseTime { get; set; }
    }

    public class GenreAnalyticsDto
    {
        public string Genre { get; set; } = string.Empty;
        public int NegotiationCount { get; set; }
        public decimal AverageSuccessRate { get; set; }
        public decimal AverageDuration { get; set; }
        public decimal AverageProposedFee { get; set; }
    }

    // Real-time analytics for live updates
    public class LiveAnalyticsDto
    {
        public DateTime Timestamp { get; set; }
        public int ActiveNegotiations { get; set; }
        public int TodayStarted { get; set; }
        public int TodayCompleted { get; set; }
        public List<RecentActivityDto> RecentActivities { get; set; } = new();
        public List<PhaseDistributionDto> CurrentPhaseDistribution { get; set; } = new();
    }

    public class RecentActivityDto
    {
        public DateTime Timestamp { get; set; }
        public int NegotiationId { get; set; }
        public string PerformerName { get; set; } = string.Empty;
        public string EventName { get; set; } = string.Empty;
        public string ActivityType { get; set; } = string.Empty; // PhaseTransition, RequirementFulfilled, NegotiationStarted, etc.
        public string Description { get; set; } = string.Empty;
        public string FromPhase { get; set; } = string.Empty;
        public string ToPhase { get; set; } = string.Empty;
    }

    // Filter parameters for analytics queries
    public class AnalyticsFilterDto
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public List<int>? PerformerIds { get; set; }
        public List<int>? EventIds { get; set; }
        public List<string>? Genres { get; set; }
        public List<string>? Statuses { get; set; }
        public List<int>? PhaseIds { get; set; }
        public string? GroupBy { get; set; } // day, week, month
    }
}