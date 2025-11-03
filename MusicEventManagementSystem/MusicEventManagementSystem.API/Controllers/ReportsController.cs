using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.API.Services.IService;
using MusicEventManagementSystem.API.DTOs;
using MusicEventManagementSystem.API.Repositories.IRepositories;

namespace MusicEventManagementSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly IPdfReportService _pdfReportService;
        private readonly ILogger<ReportsController> _logger;
        private readonly IReportRepository _reportRepository;

        public ReportsController(
            IPdfReportService pdfReportService, 
            ILogger<ReportsController> logger,
            IReportRepository reportRepository)
        {
            _pdfReportService = pdfReportService;
            _logger = logger;
            _reportRepository = reportRepository;
        }

        /// <summary>
        /// Generate comprehensive analytics PDF report
        /// </summary>
        [HttpGet("analytics/pdf")]
        [HttpPost("analytics/pdf")]
        public async Task<IActionResult> GenerateAnalyticsReport([FromQuery] DateTime? startDate = null, 
            [FromQuery] DateTime? endDate = null, 
            [FromQuery] List<int>? performerIds = null,
            [FromQuery] List<int>? eventIds = null,
            [FromQuery] List<string>? genres = null,
            [FromQuery] List<string>? statuses = null,
            [FromQuery] List<int>? phaseIds = null,
            [FromQuery] string? groupBy = null)
        {
            try
            {
                var filter = new AnalyticsFilterDto
                {
                    StartDate = startDate,
                    EndDate = endDate,
                    PerformerIds = performerIds,
                    EventIds = eventIds,
                    Genres = genres,
                    Statuses = statuses,
                    PhaseIds = phaseIds,
                    GroupBy = groupBy ?? "week"
                };

                var pdfData = await _pdfReportService.GenerateAnalyticsReportAsync(filter);
                
                var fileName = $"MEMS_Analitika_{DateTime.Now:yyyy-MM-dd_HH-mm}.pdf";
                
                return File(pdfData, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating analytics PDF report");
                return StatusCode(500, "Greška prilikom generisanja PDF reporta");
            }
        }

        /// <summary>
        /// Generate performer-specific PDF report
        /// </summary>
        [HttpGet("performer/{performerId}/pdf")]
        public async Task<IActionResult> GeneratePerformerReport(int performerId,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var filter = new AnalyticsFilterDto
                {
                    StartDate = startDate,
                    EndDate = endDate
                };

                var pdfData = await _pdfReportService.GeneratePerformerReportAsync(performerId, filter);
                
                var fileName = $"MEMS_Performer_{performerId}_{DateTime.Now:yyyy-MM-dd_HH-mm}.pdf";
                
                return File(pdfData, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating performer PDF report for performer {PerformerId}", performerId);
                return StatusCode(500, "Greška prilikom generisanja performer PDF reporta");
            }
        }

        /// <summary>
        /// Generate event-specific PDF report
        /// </summary>
        [HttpGet("event/{eventId}/pdf")]
        public async Task<IActionResult> GenerateEventReport(int eventId,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var filter = new AnalyticsFilterDto
                {
                    StartDate = startDate,
                    EndDate = endDate
                };

                var pdfData = await _pdfReportService.GenerateEventReportAsync(eventId, filter);
                
                var fileName = $"MEMS_Event_{eventId}_{DateTime.Now:yyyy-MM-dd_HH-mm}.pdf";
                
                return File(pdfData, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating event PDF report for event {EventId}", eventId);
                return StatusCode(500, "Greška prilikom generisanja event PDF reporta");
            }
        }

        /// <summary>
        /// Generate dashboard summary PDF report
        /// </summary>
        [HttpGet("dashboard/pdf")]
        public async Task<IActionResult> GenerateDashboardReport(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var filter = new AnalyticsFilterDto
                {
                    StartDate = startDate,
                    EndDate = endDate
                };

                var pdfData = await _pdfReportService.GenerateDashboardReportAsync(filter);
                
                var fileName = $"MEMS_Dashboard_{DateTime.Now:yyyy-MM-dd_HH-mm}.pdf";
                
                return File(pdfData, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating dashboard PDF report");
                return StatusCode(500, "Greška prilikom generisanja dashboard PDF reporta");
            }
        }

        /// <summary>
        /// Generate multiple reports in ZIP format
        /// </summary>
        [HttpPost("bulk/pdf")]
        public async Task<IActionResult> GenerateBulkReports([FromBody] BulkReportRequestDto request)
        {
            try
            {
                var reports = new List<(byte[] data, string fileName)>();

                if (request.IncludeAnalytics)
                {
                    var analyticsData = await _pdfReportService.GenerateAnalyticsReportAsync(request.Filter);
                    reports.Add((analyticsData, $"MEMS_Analitika_{DateTime.Now:yyyy-MM-dd}.pdf"));
                }

                if (request.IncludeDashboard)
                {
                    var dashboardData = await _pdfReportService.GenerateDashboardReportAsync(request.Filter);
                    reports.Add((dashboardData, $"MEMS_Dashboard_{DateTime.Now:yyyy-MM-dd}.pdf"));
                }

                if (request.PerformerIds?.Any() == true)
                {
                    foreach (var performerId in request.PerformerIds)
                    {
                        var performerData = await _pdfReportService.GeneratePerformerReportAsync(performerId, request.Filter);
                        reports.Add((performerData, $"MEMS_Performer_{performerId}_{DateTime.Now:yyyy-MM-dd}.pdf"));
                    }
                }

                if (request.EventIds?.Any() == true)
                {
                    foreach (var eventId in request.EventIds)
                    {
                        var eventData = await _pdfReportService.GenerateEventReportAsync(eventId, request.Filter);
                        reports.Add((eventData, $"MEMS_Event_{eventId}_{DateTime.Now:yyyy-MM-dd}.pdf"));
                    }
                }

                if (reports.Count == 0)
                {
                    return BadRequest("Nisu specificirani reporti za generisanje");
                }

                if (reports.Count == 1)
                {
                    return File(reports[0].data, "application/pdf", reports[0].fileName);
                }

                // Create ZIP file for multiple reports
                using var memoryStream = new MemoryStream();
                using (var archive = new System.IO.Compression.ZipArchive(memoryStream, System.IO.Compression.ZipArchiveMode.Create, true))
                {
                    foreach (var (data, fileName) in reports)
                    {
                        var entry = archive.CreateEntry(fileName);
                        using var entryStream = entry.Open();
                        await entryStream.WriteAsync(data);
                    }
                }

                var zipFileName = $"MEMS_Reporti_{DateTime.Now:yyyy-MM-dd_HH-mm}.zip";
                return File(memoryStream.ToArray(), "application/zip", zipFileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating bulk PDF reports");
                return StatusCode(500, "Greška prilikom generisanja bulk PDF reporta");
            }
        }

        /// <summary>
        /// Preview analytics report data (JSON format for testing)
        /// </summary>
        [HttpGet("analytics/preview")]
        public async Task<ActionResult<object>> PreviewAnalyticsReport([FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var filter = new AnalyticsFilterDto
                {
                    StartDate = startDate,
                    EndDate = endDate,
                    GroupBy = "week"
                };

                // This would normally be part of the PDF service, but we can create a preview
                var result = new
                {
                    Filter = filter,
                    GeneratedAt = DateTime.UtcNow,
                    AvailableEndpoints = new[]
                    {
                        "GET /api/reports/analytics/pdf - Kompletni analitički report",
                        "GET /api/reports/performer/{id}/pdf - Report za određenog performera",
                        "GET /api/reports/event/{id}/pdf - Report za određeni event",
                        "GET /api/reports/dashboard/pdf - Dashboard summary report",
                        "POST /api/reports/bulk/pdf - Multiple reports u ZIP formatu"
                    },
                    SampleParameters = new
                    {
                        startDate = "2024-01-01",
                        endDate = "2024-12-31",
                        performerIds = new[] { 1, 2, 3 },
                        eventIds = new[] { 1, 2, 3 },
                        genres = new[] { "Rock", "Pop", "Jazz" },
                        statuses = new[] { "Active", "Completed" },
                        phaseIds = new[] { 1, 2, 3, 4, 5 },
                        groupBy = "week"
                    }
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error previewing analytics report");
                return StatusCode(500, "Greška prilikom pregleda reporta");
            }
        }

        /// <summary>
        /// Dobija kompletan izveštaj o pregovorima grupisanim po eventima
        /// </summary>
        /// <returns>Lista sažetaka pregovora po eventima</returns>
        [HttpGet("negotiations/by-events")]
        public async Task<ActionResult<IEnumerable<EventNegotiationSummaryDto>>> GetEventNegotiationsReport()
        {
            try
            {
                var report = await _reportRepository.GetEventNegotiationsReportAsync();
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating event negotiations report");
                return StatusCode(500, $"Greška pri generisanju izveštaja: {ex.Message}");
            }
        }

        /// <summary>
        /// Dobija kompletan izveštaj o pregovorima grupisanim po performerima i fazama
        /// </summary>
        /// <returns>Lista statistika pregovora po performerima i fazama</returns>
        [HttpGet("negotiations/by-performer-phases")]
        public async Task<ActionResult<IEnumerable<PerformerPhaseStatsDto>>> GetPerformerPhaseReport()
        {
            try
            {
                var report = await _reportRepository.GetPerformerPhaseReportAsync();
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating performer phase report");
                return StatusCode(500, $"Greška pri generisanju izveštaja: {ex.Message}");
            }
        }
    }

    public class BulkReportRequestDto
    {
        public bool IncludeAnalytics { get; set; } = true;
        public bool IncludeDashboard { get; set; } = true;
        public List<int>? PerformerIds { get; set; }
        public List<int>? EventIds { get; set; }
        public AnalyticsFilterDto? Filter { get; set; }
    }
}