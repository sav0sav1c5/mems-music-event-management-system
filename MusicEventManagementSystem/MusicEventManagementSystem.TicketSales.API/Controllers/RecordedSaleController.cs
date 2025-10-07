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

        public RecordedSaleController(IRecordedSaleService recordedSaleService)
        {
            _recordedSaleService = recordedSaleService;
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

        /// <summary>
        /// Vraća kompleksnu analizu revenue-a za određeni period
        /// Koristi PL/pgSQL funkciju za kalkulaciju
        /// </summary>
        /// <param name="startDate">Početni datum perioda</param>
        /// <param name="endDate">Krajnji datum perioda</param>
        /// <returns>Revenue analiza sa ukupnim prihodima, brojem prodaja i prosekom</returns>
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
    }
}
