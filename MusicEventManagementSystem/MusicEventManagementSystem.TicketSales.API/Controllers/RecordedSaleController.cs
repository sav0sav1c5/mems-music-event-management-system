using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Interfaces.Services.ITicketSales;
using MusicEventManagementSystem.Core.Models.DTOs.TicketSales;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;

namespace MusicEventManagementSystem.TicketSales.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RecordedSaleController : ControllerBase
    {
        private readonly IRecordedSaleService _recordedSaleService;
        private readonly ILogger<RecordedSaleController> _logger;

        public RecordedSaleController(IRecordedSaleService recordedSaleService, ILogger<RecordedSaleController> logger)
        {
            _recordedSaleService = recordedSaleService;
            _logger = logger;
        }

        [Authorize(Roles = "TicketSales")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RecordedSaleResponseDto>>> GetAllRecordedSales()
        {
            try
            {
                var recordedSales = await _recordedSaleService.GetAllRecordedSalesAsync();
                return Ok(recordedSales);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "MEMSClient,TicketSales")]
        [HttpGet("{id}")]
        public async Task<ActionResult<RecordedSaleResponseDto>> GetRecordedSaleById(int id)
        {
            try
            {
                var existingRecordedSale = await _recordedSaleService.GetRecordedSaleByIdAsync(id);

                if (existingRecordedSale == null)
                {
                    return NotFound($"Recorded Sale with ID {id} not found.");
                }

                return Ok(existingRecordedSale);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "MEMSClient,TicketSales")]
        [HttpPost]
        public async Task<ActionResult<RecordedSaleResponseDto>> CreateRecordedSale([FromBody] RecordedSaleCreateDto createRecordedSaleDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdRecordedSale = await _recordedSaleService.CreateRecordedSaleAsync(createRecordedSaleDto);

                return CreatedAtAction(nameof(GetRecordedSaleById), new { id = createdRecordedSale.RecordedSaleId }, createdRecordedSale);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "MEMSClient,TicketSales")]
        [HttpPut("{id}")]
        public async Task<ActionResult<RecordedSaleResponseDto>> UpdateRecordedSale(int id, [FromBody] RecordedSaleUpdateDto updateRecordedSaleDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedRecordedSale = await _recordedSaleService.UpdateRecordedSaleAsync(id, updateRecordedSaleDto);

                if (updatedRecordedSale == null)
                {
                    return NotFound($"Recorded Sale with ID {id} not found.");
                }

                return Ok(updatedRecordedSale);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "TicketSales")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteRecordedSale(int id)
        {
            try
            {
                var isDeleted = await _recordedSaleService.DeleteRecordedSaleAsync(id);

                if (isDeleted == false)
                {
                    return NotFound($"Recorded Sale with ID {id} not found.");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "MEMSClient,TicketSales")]
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<RecordedSaleResponseDto>>> GetSalesByUser(string userId)
        {
            try
            {
                var sales = await _recordedSaleService.GetSalesByUserAsync(userId);
                return Ok(sales);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "TicketSales")]
        [HttpGet("date-range")]
        public async Task<ActionResult<IEnumerable<RecordedSaleResponseDto>>> GetSalesByDateRange([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate)
        {
            try
            {
                var sales = await _recordedSaleService.GetSalesByDateRangeAsync(fromDate, toDate);
                return Ok(sales);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "TicketSales")]
        [HttpGet("status/{status}")]
        public async Task<ActionResult<IEnumerable<RecordedSaleResponseDto>>> GetSalesByStatus(TransactionStatus status)
        {
            try
            {
                var sales = await _recordedSaleService.GetSalesByStatusAsync(status);
                return Ok(sales);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "TicketSales")]
        [HttpGet("payment-method/{paymentMethod}")]
        public async Task<ActionResult<IEnumerable<RecordedSaleResponseDto>>> GetSalesByPaymentMethod(PaymentMethod paymentMethod)
        {
            try
            {
                var sales = await _recordedSaleService.GetSalesByPaymentMethodAsync(paymentMethod);
                return Ok(sales);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "TicketSales")]
        [HttpGet("revenue/total")]
        public async Task<ActionResult<decimal>> GetTotalRevenue()
        {
            try
            {
                var revenue = await _recordedSaleService.GetTotalRevenueAsync();
                return Ok(revenue);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "TicketSales")]
        [HttpGet("revenue/date-range")]
        public async Task<ActionResult<decimal>> GetRevenueByDateRange([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate)
        {
            try
            {
                var revenue = await _recordedSaleService.GetRevenueByDateRangeAsync(fromDate, toDate);
                return Ok(revenue);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize(Roles = "TicketSales")]
        [HttpGet("count/status/{status}")]
        public async Task<ActionResult<int>> GetSalesCountByStatus(TransactionStatus status)
        {
            try
            {
                var count = await _recordedSaleService.GetSalesCountByStatusAsync(status);
                return Ok(count);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Returns a complex revenue analysis for a specific period with total revenue, number of sales and average
        [Authorize(Roles = "TicketSales")]
        [HttpGet("analytics/revenue")]
        public async Task<ActionResult<RevenueAnalysisDto>> GetRevenueAnalytics([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                // Validacija datuma
                if (startDate > endDate)
                {
                    return BadRequest("Start date must be before end date.");
                }

                var analysis = await _recordedSaleService.GetRevenueAnalysisAsync(startDate, endDate);
                return Ok(analysis);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Generates a complex analysis of ticket sales
        [Authorize(Roles = "TicketSales")]
        [HttpGet("comprehensive")]
        public async Task<IActionResult> GetComprehensiveAnalysis([FromQuery] int? eventId = null, [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var report = await _recordedSaleService.GenerateComprehensiveAnalysisAsync(
                    eventId, startDate, endDate);

                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating sales analysis");
                return StatusCode(500, "An error occurred while generating the analysis");
            }
        }

        // Exports the analysis in PDF format
        [Authorize(Roles = "TicketSales")]
        [HttpGet("export/pdf")]
        public async Task<IActionResult> ExportToPdf([FromQuery] int? eventId = null, [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var pdfBytes = await _recordedSaleService.ExportAnalysisToPdfAsync(eventId, startDate, endDate);

                var fileName = $"sales_analysis_{DateTime.UtcNow:yyyyMMdd_HHmmss}.pdf";

                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when exporting to PDF");
                return StatusCode(500, "An error occurred during export");
            }
        }

        // Exports analysis to Excel format
        [Authorize(Roles = "TicketSales")]
        [HttpGet("export/excel")]
        public async Task<IActionResult> ExportToExcel([FromQuery] int? eventId = null, [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var excelBytes = await _recordedSaleService.ExportAnalysisToExcelAsync(
                    eventId, startDate, endDate);

                var fileName = $"sales_analysis_{DateTime.UtcNow:yyyyMMdd_HHmmss}.xlsx";

                return File(excelBytes,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when exporting to Excel");
                return StatusCode(500, "An error occurred during export");
            }
        }

        // Generates a single analysis section (optimized for performance)
        [Authorize(Roles = "TicketSales")]
        [HttpGet("section/{sectionName}")]
        public async Task<IActionResult> GetAnalysisSection(string sectionName, [FromQuery] int? eventId = null, [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var fullReport = await _recordedSaleService.GenerateComprehensiveAnalysisAsync(
                    eventId, startDate, endDate);

                if (fullReport.Sections.TryGetValue(sectionName.ToUpper(), out var section))
                {
                    return Ok(section);
                }

                return NotFound($"Section '{sectionName}' not found");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while generating section of analysis");
                return StatusCode(500, "An error occurred");
            }
        }

        // Get sales audit log (triggered by database trigger)
        [Authorize(Roles = "TicketSales")]
        [HttpGet("audit-log")]
        public async Task<IActionResult> GetSalesAuditLog([FromQuery] int limit = 50)
        {
            try
            {
                var auditLog = await _recordedSaleService.GetSalesAuditLogAsync(limit);
                return Ok(auditLog);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving audit log");
                return StatusCode(500, "An error occurred while retrieving audit log");
            }
        }

        // Get index performance statistics
        [Authorize(Roles = "TicketSales")]
        [HttpGet("performance/indexes")]
        public async Task<IActionResult> GetIndexPerformance()
        {
            try
            {
                var performance = await _recordedSaleService.GetIndexPerformanceAsync();
                return Ok(performance);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving index performance");
                return StatusCode(500, "An error occurred while retrieving performance data");
            }
        }
    }
}
