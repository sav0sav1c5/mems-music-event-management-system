using MusicEventManagementSystem.API.Services.Proxies.IProxies;
using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;
using System.Text.Json;

namespace MusicEventManagementSystem.API.Services.Proxies
{
    public class TicketProxyService : ITicketProxyService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<TicketProxyService> _logger;
        private readonly JsonSerializerOptions _jsonOptions;

        public TicketProxyService(IHttpClientFactory httpClientFactory, IHttpContextAccessor httpContextAccessor, ILogger<TicketProxyService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        }

        public async Task<TicketResponseDto> CreateTicketAsync(TicketCreateDto createDto)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");

            // Pass JWT token from incoming request to the outgoing request
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();

            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Add("Authorization", token);
            }

            try
            {
                var response = await client.PostAsJsonAsync("/api/ticket", createDto);
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<TicketResponseDto>(_jsonOptions)
                    ?? throw new InvalidOperationException("Failed to deserialize ticket response");
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error creating ticket via TicketSales API");
                throw new InvalidOperationException("Failed to create ticket via microservice", ex);
            }
        }

        public async Task<TicketResponseDto?> GetTicketByIdAsync(int id)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");

            // Pass JWT token from incoming request to the outgoing request
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();

            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Add("Authorization", token);
            }

            try
            {
                var response = await client.GetAsync($"/api/ticket/{id}");
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<TicketResponseDto>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting ticket {Id} via TicketSales API", id);
                throw new InvalidOperationException($"Failed to get ticket {id} via microservice", ex);
            }
        }

        public async Task<IEnumerable<TicketResponseDto>> GetAllTicketsAsync()
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");

            // Pass JWT token from incoming request to the outgoing request
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();

            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Add("Authorization", token);
            }

            try
            {
                var response = await client.GetAsync("/api/ticket");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<TicketResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<TicketResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting all tickets via TicketSales API");
                throw new InvalidOperationException("Failed to get tickets via microservice", ex);
            }
        }

        public async Task<IEnumerable<TicketResponseDto>> GetTicketsByStatusAsync(TicketStatus status)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");

            // Pass JWT token from incoming request to the outgoing request
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();

            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Add("Authorization", token);
            }

            try
            {
                var response = await client.GetAsync($"/api/ticket/status/{status}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<TicketResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<TicketResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting tickets by status via TicketSales API");
                throw new InvalidOperationException("Failed to get tickets by status via microservice", ex);
            }
        }

        public async Task<TicketResponseDto?> GetTicketByUniqueCodeAsync(string uniqueCode)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");

            // Pass JWT token from incoming request to the outgoing request
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();

            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Add("Authorization", token);
            }

            try
            {
                var response = await client.GetAsync($"/api/ticket/unique-code/{uniqueCode}");
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<TicketResponseDto>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting ticket by unique code via TicketSales API");
                throw new InvalidOperationException("Failed to get ticket by code via microservice", ex);
            }
        }

        public async Task<TicketResponseDto?> GetTicketByQrCodeAsync(string qrCode)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");

            // Pass JWT token from incoming request to the outgoing request
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();

            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Add("Authorization", token);
            }

            try
            {
                var response = await client.GetAsync($"/api/ticket/qr-code/{qrCode}");
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<TicketResponseDto>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting ticket by QR code via TicketSales API");
                throw new InvalidOperationException("Failed to get ticket by QR code via microservice", ex);
            }
        }

        public async Task<IEnumerable<TicketResponseDto>> GetSoldTicketsAsync()
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");

            // Pass JWT token from incoming request to the outgoing request
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();

            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Add("Authorization", token);
            }

            try
            {
                var response = await client.GetAsync("/api/ticket/sold");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<TicketResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<TicketResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting sold tickets via TicketSales API");
                throw new InvalidOperationException("Failed to get sold tickets via microservice", ex);
            }
        }

        public async Task<IEnumerable<TicketResponseDto>> GetTodaysTicketsAsync()
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");

            // Pass JWT token from incoming request to the outgoing request
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();

            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Add("Authorization", token);
            }

            try
            {
                var response = await client.GetAsync("/api/ticket/today");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<TicketResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<TicketResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting today's tickets via TicketSales API");
                throw new InvalidOperationException("Failed to get today's tickets via microservice", ex);
            }
        }

        public async Task<TicketResponseDto?> UpdateTicketAsync(int id, TicketUpdateDto updateDto)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");

            // Pass JWT token from incoming request to the outgoing request
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();

            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Add("Authorization", token);
            }

            try
            {
                var response = await client.PutAsJsonAsync($"/api/ticket/{id}", updateDto);
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<TicketResponseDto>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error updating ticket via TicketSales API");
                throw new InvalidOperationException("Failed to update ticket via microservice", ex);
            }
        }

        public async Task<bool> DeleteTicketAsync(int id)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");

            // Pass JWT token from incoming request to the outgoing request
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();

            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Add("Authorization", token);
            }

            try
            {
                var response = await client.DeleteAsync($"/api/ticket/{id}");
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return false;
                response.EnsureSuccessStatusCode();
                return true;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error deleting ticket via TicketSales API");
                throw new InvalidOperationException("Failed to delete ticket via microservice", ex);
            }
        }

        public async Task<TicketResponseDto?> SellTicketAsync(int id)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");

            // Pass JWT token from incoming request to the outgoing request
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();

            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Add("Authorization", token);
            }

            try
            {
                var response = await client.PostAsync($"/api/ticket/{id}/sell", null);
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<TicketResponseDto>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error selling ticket via TicketSales API");
                throw new InvalidOperationException("Failed to sell ticket via microservice", ex);
            }
        }

        public async Task<TicketResponseDto?> UseTicketAsync(string uniqueCode)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");

            // Pass JWT token from incoming request to the outgoing request
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();

            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Add("Authorization", token);
            }

            try
            {
                var response = await client.PostAsync($"/api/ticket/use/{Uri.EscapeDataString(uniqueCode)}", null);
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<TicketResponseDto>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error using ticket via TicketSales API");
                throw new InvalidOperationException("Failed to use ticket via microservice", ex);
            }
        }

        public async Task<TicketResponseDto?> CancelTicketAsync(int ticketId)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");

            // Pass JWT token from incoming request to the outgoing request
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();

            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Add("Authorization", token);
            }

            try
            {
                var response = await client.PostAsync($"/api/ticket/{ticketId}/cancel", null);
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<TicketResponseDto>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error canceling ticket via TicketSales API");
                throw new InvalidOperationException("Failed to cancel ticket via microservice", ex);
            }
        }

        public async Task<int> GetTicketsCountByStatusAsync(TicketStatus status)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");

            // Pass JWT token from incoming request to the outgoing request
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();

            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Add("Authorization", token);
            }

            try
            {
                var response = await client.GetAsync($"/api/ticket/statistics/count/{status}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<int>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting ticket count via TicketSales API");
                throw new InvalidOperationException("Failed to get ticket count via microservice", ex);
            }
        }

        public async Task<decimal> GetTotalRevenueAsync()
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");

            // Pass JWT token from incoming request to the outgoing request
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();

            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Add("Authorization", token);
            }

            try
            {
                var response = await client.GetAsync($"/api/ticket/statistics/revenue/total");
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

            // Pass JWT token from incoming request to the outgoing request
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();

            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Add("Authorization", token);
            }

            try
            {
                var response = await client.GetAsync($"/api/ticket/statistics/revenue/date-range?from={from:o}&to={to:o}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<decimal>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting revenue by date range via TicketSales API");
                throw new InvalidOperationException("Failed to get revenue by date range via microservice", ex);
            }
        }

        public async Task<decimal> GetRevenueByStatusAsync(TicketStatus status)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");

            // Pass JWT token from incoming request to the outgoing request
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();

            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Add("Authorization", token);
            }

            try
            {
                var response = await client.GetAsync($"/api/ticket/statistics/revenue/status/{status}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<decimal>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting revenue by status via TicketSales API");
                throw new InvalidOperationException("Failed to get revenue by status via microservice", ex);
            }
        }

        public async Task<bool> IsUniqueCodeValidAsync(string uniqueCode)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");

            // Pass JWT token from incoming request to the outgoing request
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();

            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Add("Authorization", token);
            }

            try
            {
                var response = await client.GetAsync($"/api/ticket/validate/unique-code/{uniqueCode}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<bool>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error validating unique code via TicketSales API");
                throw new InvalidOperationException("Failed to validate unique code via microservice", ex);
            }
        }

        public async Task<bool> IsQrCodeValidAsync(string qrCode)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");

            // Pass JWT token from incoming request to the outgoing request
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();

            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Add("Authorization", token);
            }

            try
            {
                var response = await client.GetAsync($"/api/ticket/validate/qr-code/{qrCode}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<bool>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error validating QR code via TicketSales API");
                throw new InvalidOperationException("Failed to validate QR code via microservice", ex);
            }
        }

        public async Task<bool> CanTicketBeUsedAsync(string uniqueCode)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");

            // Pass JWT token from incoming request to the outgoing request
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();

            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Add("Authorization", token);
            }

            try
            {
                var response = await client.GetAsync($"/api/ticket/can-use/{Uri.EscapeDataString(uniqueCode)}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<bool>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error checking if ticket can be used via TicketSales API");
                throw new InvalidOperationException("Failed to check ticket usage via microservice", ex);
            }
        }
    }
}
