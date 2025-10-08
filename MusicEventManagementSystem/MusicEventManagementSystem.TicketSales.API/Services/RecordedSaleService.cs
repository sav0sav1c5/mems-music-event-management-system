using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Interfaces.Repositories.ITicketSales;
using MusicEventManagementSystem.Core.Interfaces.Services.ITicketSales;
using MusicEventManagementSystem.Core.Models.DTOs.TicketSales;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;
using MusicEventManagementSystem.Infrastructure.Database;
using MusicEventManagementSystem.Infrastructure.Repositories;
using Npgsql;
using System.Text.Json;

namespace MusicEventManagementSystem.TicketSales.API.Services
{
    public class RecordedSaleService : IRecordedSaleService
    {
        private readonly IRecordedSaleRepository _recordedSaleRepository;
        private readonly IConfiguration _configuration;
        private readonly string _connectionString;
        private readonly IPdfGeneratorService _pdfGenerator;
        private readonly ITicketRepository _ticketRepository;
        private readonly ApplicationDbContext _context;

        public RecordedSaleService(IRecordedSaleRepository recordedSaleRepository, IConfiguration configuration, IPdfGeneratorService pdfGenerator, ITicketRepository ticketRepository, ApplicationDbContext context)
        {
            _recordedSaleRepository = recordedSaleRepository;
            _configuration = configuration;
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _pdfGenerator = pdfGenerator;
            _ticketRepository = ticketRepository;
            _context = context;
        }

        public async Task<IEnumerable<RecordedSaleResponseDto>> GetAllRecordedSalesAsync()
        {
            var recordedSales = await _recordedSaleRepository.GetAllAsync();
            return recordedSales.Select(MapToResponseDto);
        }

        public async Task<RecordedSaleResponseDto?> GetRecordedSaleByIdAsync(int id)
        {
            var recordedSale = await _recordedSaleRepository.GetByIdAsync(id);
            
            if (recordedSale == null)
            {
                return null;
            }

            return MapToResponseDto(recordedSale);
        }

        public async Task<RecordedSaleResponseDto> CreateRecordedSaleAsync(RecordedSaleCreateDto createRecordedSaleDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // VALIDACIJA - prodaja mora imati tikete
                if (createRecordedSaleDto.TicketIds == null || !createRecordedSaleDto.TicketIds.Any())
                {
                    throw new ArgumentException("Prodaja mora imati barem jedan tiket");
                }

                // 1. Kreiraj prodaju
                var recordedSale = MapToEntity(createRecordedSaleDto);
                recordedSale.SaleDate = DateTime.UtcNow;

                await _recordedSaleRepository.AddAsync(recordedSale);
                await _recordedSaleRepository.SaveChangesAsync();

                // 2. POVEŽI POSTOJEĆE TIKETE SA PRODAJOM
                foreach (var ticketId in createRecordedSaleDto.TicketIds)
                {
                    var ticket = await _ticketRepository.GetByIdAsync(ticketId);
                    if (ticket == null)
                        throw new Exception($"Tiket sa ID {ticketId} ne postoji");

                    if (ticket.RecordedSaleId != null)
                        throw new Exception($"Tiket sa ID {ticketId} je već prodat");

                    ticket.RecordedSaleId = recordedSale.RecordedSaleId;
                    ticket.Status = TicketStatus.Sold;
                    _ticketRepository.Update(ticket);
                }

                await _ticketRepository.SaveChangesAsync();
                await transaction.CommitAsync();

                return MapToResponseDto(recordedSale);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new Exception($"Greška pri kreiranju prodaje: {ex.Message}");
            }
        }

        public async Task<RecordedSaleResponseDto?> UpdateRecordedSaleAsync(int id, RecordedSaleUpdateDto updateRecordedSaleDto)
        {
            var existingRecordedSale = await _recordedSaleRepository.GetByIdAsync(id);

            if (existingRecordedSale == null)
            {
                return null;
            }

            if (updateRecordedSaleDto.TotalAmount.HasValue)
                existingRecordedSale.TotalAmount = updateRecordedSaleDto.TotalAmount.Value;

            if (updateRecordedSaleDto.PaymentMethod.HasValue)
                existingRecordedSale.PaymentMethod = updateRecordedSaleDto.PaymentMethod.Value;

            if (updateRecordedSaleDto.SaleDate.HasValue)
                existingRecordedSale.SaleDate = updateRecordedSaleDto.SaleDate.Value;

            if (updateRecordedSaleDto.TransactionStatus.HasValue)
                existingRecordedSale.TransactionStatus = updateRecordedSaleDto.TransactionStatus.Value;

            _recordedSaleRepository.Update(existingRecordedSale);
            await _recordedSaleRepository.SaveChangesAsync();
            return MapToResponseDto(existingRecordedSale);
        }

        public async Task<bool> DeleteRecordedSaleAsync(int id)
        {
            var recordedSale = await _recordedSaleRepository.GetByIdAsync(id);
            
            if (recordedSale == null)
            {
                return false;
            }

            _recordedSaleRepository.Delete(recordedSale);
            await _recordedSaleRepository.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<RecordedSaleResponseDto>> GetSalesByUserAsync(string userId)
        {
            var sales = await _recordedSaleRepository.GetSalesByUserAsync(userId);
            return sales.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<RecordedSaleResponseDto>> GetSalesByDateRangeAsync(DateTime fromDate, DateTime toDate)
        {
            var sales = await _recordedSaleRepository.GetSalesByDateRangeAsync(fromDate, toDate);
            return sales.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<RecordedSaleResponseDto>> GetSalesByStatusAsync(TransactionStatus status)
        {
            var sales = await _recordedSaleRepository.GetSalesByStatusAsync(status);
            return sales.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<RecordedSaleResponseDto>> GetSalesByPaymentMethodAsync(PaymentMethod paymentMethod)
        {
            var sales = await _recordedSaleRepository.GetSalesByPaymentMethodAsync(paymentMethod);
            return sales.Select(MapToResponseDto);
        }

        public async Task<decimal> GetTotalRevenueAsync()
        {
            return await _recordedSaleRepository.GetTotalRevenueAsync();
        }

        public async Task<decimal> GetRevenueByDateRangeAsync(DateTime from, DateTime to)
        {
            return await _recordedSaleRepository.GetRevenueByDateRangeAsync(from, to);
        }

        public async Task<int> GetSalesCountByStatusAsync(TransactionStatus status)
        {
            return await _recordedSaleRepository.GetSalesCountByStatusAsync(status);
        }

        public async Task<RevenueAnalysisDto> GetRevenueAnalysisAsync(DateTime startDate, DateTime endDate)
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");

            await using var connection = new NpgsqlConnection(connectionString);
            await connection.OpenAsync();

            // Call the stored procedure - PLSQL function
            await using var cmd = new NpgsqlCommand(
                "SELECT * FROM calculate_total_revenue(@startDate, @endDate)",
                connection);

            cmd.Parameters.AddWithValue("startDate", startDate);
            cmd.Parameters.AddWithValue("endDate", endDate);

            await using var reader = await cmd.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                return new RevenueAnalysisDto
                {
                    TotalRevenue = reader.GetDecimal(0),      // total_revenue
                    TotalSales = reader.GetInt32(1),          // total_sales
                    AverageSaleAmount = reader.GetDecimal(2), // average_sale_amount
                    PeriodStart = reader.GetDateTime(3),      // period_start
                    PeriodEnd = reader.GetDateTime(4)         // period_end
                };
            }

            // If no data is returned, return zeros
            return new RevenueAnalysisDto
            {
                TotalRevenue = 0,
                TotalSales = 0,
                AverageSaleAmount = 0,
                PeriodStart = startDate,
                PeriodEnd = endDate
            };
        }

        public async Task<AnalysisReport> GenerateComprehensiveAnalysisAsync(int? eventId = null, DateTime? startDate = null, DateTime? endDate = null)
        {
            var results = new List<SalesAnalysisResult>();

            await using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            // Call the stored procedure - PLSQL function
            await using var cmd = new NpgsqlCommand(
                            "SELECT * FROM sp_comprehensive_sales_analysis_v2(@eventId, @startDate, @endDate)",
                            connection);

            cmd.Parameters.AddWithValue("eventId", eventId ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("startDate", startDate ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("endDate", endDate ?? (object)DBNull.Value);

            await using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                var result = new SalesAnalysisResult
                {
                    AnalysisSection = reader.GetString(0),
                    MetricName = reader.GetString(1),
                    MetricValue = reader.GetDecimal(2),
                    MetricUnit = reader.GetString(3),
                    AdditionalInfo = reader.IsDBNull(4) ? null : JsonDocument.Parse(reader.GetString(4))
                };
                results.Add(result);
            }

            // Group results by section
            var groupedResults = results
                .GroupBy(r => r.AnalysisSection)
                .ToDictionary(g => g.Key, g => g.ToList());

            // Create summary
            var summary = CreateSummary(results);

            return new AnalysisReport
            {
                GeneratedAt = DateTime.UtcNow,
                EventId = eventId,
                StartDate = startDate ?? DateTime.UtcNow.AddDays(-30),
                EndDate = endDate ?? DateTime.UtcNow,
                Sections = groupedResults,
                Summary = summary
            };
        }

        public async Task<byte[]> ExportAnalysisToPdfAsync(int? eventId = null, DateTime? startDate = null, DateTime? endDate = null)
        {
            // Generate comperhensive analysis report
            var report = await GenerateComprehensiveAnalysisAsync(eventId, startDate, endDate);

            // Convert report to PDF
            return _pdfGenerator.GenerateSalesAnalysisPdf(report);
        }

        public async Task<byte[]> ExportAnalysisToExcelAsync(int? eventId = null, DateTime? startDate = null, DateTime? endDate = null)
        {
            var report = await GenerateComprehensiveAnalysisAsync(eventId, startDate, endDate);

            using var package = new OfficeOpenXml.ExcelPackage();

            foreach (var section in report.Sections)
            {
                var worksheet = package.Workbook.Worksheets.Add(section.Key);

                // Headers
                worksheet.Cells[1, 1].Value = "Metrika";
                worksheet.Cells[1, 2].Value = "Vrednost";
                worksheet.Cells[1, 3].Value = "Jedinica";
                worksheet.Cells[1, 4].Value = "Dodatne Informacije";

                // Data
                int row = 2;
                foreach (var metric in section.Value)
                {
                    worksheet.Cells[row, 1].Value = metric.MetricName;
                    worksheet.Cells[row, 2].Value = metric.MetricValue;
                    worksheet.Cells[row, 3].Value = metric.MetricUnit;
                    worksheet.Cells[row, 4].Value = metric.AdditionalInfo?.RootElement.ToString();
                    row++;
                }

                worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();
            }

            return package.GetAsByteArray();
        }

        public async Task<List<SalesAuditLogDto>> GetSalesAuditLogAsync(int limit = 50)
        {
            var auditLogs = new List<SalesAuditLogDto>();

            await using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            // Call the helper function from SQL script
            await using var cmd = new NpgsqlCommand(
                "SELECT * FROM get_sales_audit_log(@limit)",
                connection);

            cmd.Parameters.AddWithValue("limit", limit);

            await using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                auditLogs.Add(new SalesAuditLogDto
                {
                    AuditId = reader.GetInt32(0),
                    RecordedSaleId = reader.GetInt32(1),
                    Action = reader.GetString(2),
                    OldTotalAmount = reader.IsDBNull(3) ? null : reader.GetDecimal(3),
                    NewTotalAmount = reader.IsDBNull(4) ? null : reader.GetDecimal(4),
                    TicketCount = reader.GetInt32(5),
                    ChangedAt = reader.GetDateTime(6),
                    ChangedBy = reader.GetString(7)
                });
            }

            return auditLogs;
        }

        public async Task<List<IndexPerformanceDto>> GetIndexPerformanceAsync()
        {
            var performanceTests = new List<IndexPerformanceDto>();

            await using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            // Call the performance demonstration function
            await using var cmd = new NpgsqlCommand(
                "SELECT * FROM demonstrate_index_performance()",
                connection);

            await using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                performanceTests.Add(new IndexPerformanceDto
                {
                    TestName = reader.GetString(0),
                    ExecutionTimeMs = reader.GetDecimal(1),
                    RowsReturned = reader.GetInt64(2),
                    IndexUsed = reader.GetBoolean(3)
                });
            }

            return performanceTests;
        }

        // Private helper methods for analysis report generation

        private AnalysisSummary CreateSummary(List<SalesAnalysisResult> results)
        {
            var basicMetrics = results.Where(r => r.AnalysisSection == "OSNOVNE_METRIKE").ToList();
            var zoneAnalysis = results.Where(r => r.AnalysisSection == "ANALIZA_PO_ZONAMA").ToList();
            var offerAnalysis = results.Where(r => r.AnalysisSection == "SPECIAL_OFFERS_PERFORMANCE").ToList();
            var optimization = results.Where(r => r.AnalysisSection == "REVENUE_OPTIMIZATION").ToList();

            var summary = new AnalysisSummary
            {
                TotalRevenue = basicMetrics.FirstOrDefault(m => m.MetricName == "Ukupan Revenue")?.MetricValue ?? 0,
                TotalTicketsSold = (int)(basicMetrics.FirstOrDefault(m => m.MetricName == "Ukupno Prodatih Karata")?.MetricValue ?? 0),
                AverageTicketPrice = basicMetrics.FirstOrDefault(m => m.MetricName == "Prosečna Cena Karte")?.MetricValue ?? 0,
                TopPerformingZone = zoneAnalysis.OrderByDescending(z => z.MetricValue).FirstOrDefault()?.MetricName,
                TopPerformingOffer = offerAnalysis.OrderByDescending(o => o.MetricValue).FirstOrDefault()?.MetricName,
                Recommendations = ExtractRecommendations(optimization)
            };

            return summary;
        }

        private List<string> ExtractRecommendations(List<SalesAnalysisResult> optimizationResults)
        {
            var recommendations = new List<string>();

            foreach (var result in optimizationResults)
            {
                if (result.AdditionalInfo != null &&
                    result.AdditionalInfo.RootElement.TryGetProperty("recommendation", out var recElement))
                {
                    recommendations.Add(recElement.GetString());
                }
            }

            return recommendations;
        }

        // Helper methods for mapping

        private static RecordedSaleResponseDto MapToResponseDto(RecordedSale recordedSale)
        {
            return new RecordedSaleResponseDto
            {
                RecordedSaleId = recordedSale.RecordedSaleId,
                TotalAmount = recordedSale.TotalAmount,
                PaymentMethod = recordedSale.PaymentMethod,
                SaleDate = recordedSale.SaleDate,
                TransactionStatus = recordedSale.TransactionStatus,
                ApplicationUserId = recordedSale.ApplicationUserId,
                TicketIds = recordedSale.Tickets?.Select(t => t.TicketId).ToList(),
                SpecialOfferIds = recordedSale.SpecialOffers?.Select(so => so.SpecialOfferId).ToList()
            };
        }

        private static RecordedSale MapToEntity(RecordedSaleCreateDto dto)
        {
            return new RecordedSale
            {
                TotalAmount = dto.TotalAmount,
                PaymentMethod = dto.PaymentMethod,
                SaleDate = dto.SaleDate,
                TransactionStatus = dto.TransactionStatus,
                ApplicationUserId = dto.ApplicationUserId
            };
        }
    }
}
