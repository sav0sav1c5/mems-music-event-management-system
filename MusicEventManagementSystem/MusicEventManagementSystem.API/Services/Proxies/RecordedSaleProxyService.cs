using MusicEventManagementSystem.API.Services.Proxies.IProxies;
using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;
using System.Text.Json;

namespace MusicEventManagementSystem.API.Services.Proxies
{
    public class RecordedSaleProxyService : IRecordedSaleProxyService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<RecordedSaleProxyService> _logger;
        private readonly JsonSerializerOptions _jsonOptions;

        public RecordedSaleProxyService(IHttpClientFactory httpClientFactory, ILogger<RecordedSaleProxyService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
            _jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        }

        public async Task<RecordedSaleResponseDto> CreateRecordedSaleAsync(RecordedSaleCreateDto createDto)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.PostAsJsonAsync("/api/recordedsales", createDto);
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<RecordedSaleResponseDto>(_jsonOptions)
                    ?? throw new InvalidOperationException("Failed to deserialize recorded sale response");
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error creating recorded sale via TicketSales API");
                throw new InvalidOperationException("Failed to create recorded sale via microservice", ex);
            }
        }

        public async Task<RecordedSaleResponseDto?> GetRecordedSaleByIdAsync(int id)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync($"/api/recordedsales/{id}");
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<RecordedSaleResponseDto>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting recorded sale {Id} via TicketSales API", id);
                throw new InvalidOperationException($"Failed to get recorded sale {id} via microservice", ex);
            }
        }

        public async Task<IEnumerable<RecordedSaleResponseDto>> GetAllRecordedSalesAsync()
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync("/api/recordedsales");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<RecordedSaleResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<RecordedSaleResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting all recorded sales via TicketSales API");
                throw new InvalidOperationException("Failed to get recorded sales via microservice", ex);
            }
        }

        public async Task<IEnumerable<RecordedSaleResponseDto>> GetSalesByUserAsync(string userId)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync($"/api/recordedsales/by-user/{Uri.EscapeDataString(userId)}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<RecordedSaleResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<RecordedSaleResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting sales by user via TicketSales API");
                throw new InvalidOperationException("Failed to get sales by user via microservice", ex);
            }
        }

        public async Task<IEnumerable<RecordedSaleResponseDto>> GetSalesByDateRangeAsync(DateTime fromDate, DateTime toDate)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync($"/api/recordedsales/date-range?from={fromDate:o}&to={toDate:o}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<RecordedSaleResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<RecordedSaleResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting sales by date range via TicketSales API");
                throw new InvalidOperationException("Failed to get sales by date range via microservice", ex);
            }
        }

        public async Task<IEnumerable<RecordedSaleResponseDto>> GetSalesByStatusAsync(TransactionStatus status)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync($"/api/recordedsales/by-status/{status}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<RecordedSaleResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<RecordedSaleResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting sales by status via TicketSales API");
                throw new InvalidOperationException("Failed to get sales by status via microservice", ex);
            }
        }

        public async Task<IEnumerable<RecordedSaleResponseDto>> GetSalesByPaymentMethodAsync(PaymentMethod paymentMethod)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync($"/api/recordedsales/by-payment/{paymentMethod}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<RecordedSaleResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<RecordedSaleResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting sales by payment method via TicketSales API");
                throw new InvalidOperationException("Failed to get sales by payment method via microservice", ex);
            }
        }

        public async Task<RecordedSaleResponseDto?> UpdateRecordedSaleAsync(int id, RecordedSaleUpdateDto updateDto)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.PutAsJsonAsync($"/api/recordedsales/{id}", updateDto);
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<RecordedSaleResponseDto>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error updating recorded sale via TicketSales API");
                throw new InvalidOperationException("Failed to update recorded sale via microservice", ex);
            }
        }

        public async Task<bool> DeleteRecordedSaleAsync(int id)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.DeleteAsync($"/api/recordedsales/{id}");
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return false;
                response.EnsureSuccessStatusCode();
                return true;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error deleting recorded sale via TicketSales API");
                throw new InvalidOperationException("Failed to delete recorded sale via microservice", ex);
            }
        }

        public async Task<decimal> GetTotalRevenueAsync()
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync("/api/recordedsales/revenue/total");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<decimal>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting total revenue via TicketSales API");
                throw new InvalidOperationException("Failed to get total revenue via microservice", ex);
            }
        }

        public async Task<decimal> GetRevenueByDateRangeAsync(DateTime from, DateTime to)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync($"/api/recordedsales/revenue/date-range?from={from:o}&to={to:o}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<decimal>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting revenue by date range via TicketSales API");
                throw new InvalidOperationException("Failed to get revenue by date range via microservice", ex);
            }
        }

        public async Task<int> GetSalesCountByStatusAsync(TransactionStatus status)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync($"/api/recordedsales/count/by-status/{status}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<int>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting sales count via TicketSales API");
                throw new InvalidOperationException("Failed to get sales count via microservice", ex);
            }
        }
    }
}
