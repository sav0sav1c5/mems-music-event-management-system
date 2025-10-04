using MusicEventManagementSystem.API.Services.Proxies.IProxies;
using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;
using System.Text.Json;

namespace MusicEventManagementSystem.API.Services.Proxies
{
    public class TicketTypeProxyService : ITicketTypeProxyService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<TicketTypeProxyService> _logger;
        private readonly JsonSerializerOptions _jsonOptions;

        public TicketTypeProxyService(IHttpClientFactory httpClientFactory, ILogger<TicketTypeProxyService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
            _jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        }

        public async Task<TicketTypeResponseDto> CreateTicketTypeAsync(TicketTypeCreateDto createDto)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.PostAsJsonAsync("/api/tickettype", createDto);
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<TicketTypeResponseDto>(_jsonOptions)
                    ?? throw new InvalidOperationException("Failed to deserialize ticket type response");
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error creating ticket type via TicketSales API");
                throw new InvalidOperationException("Failed to create ticket type via microservice", ex);
            }
        }

        public async Task<TicketTypeResponseDto?> GetTicketTypeByIdAsync(int id)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync($"/api/tickettype/{id}");
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<TicketTypeResponseDto>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting ticket type {Id} via TicketSales API", id);
                throw new InvalidOperationException($"Failed to get ticket type {id} via microservice", ex);
            }
        }

        public async Task<IEnumerable<TicketTypeResponseDto>> GetAllTicketTypesAsync()
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync("/api/tickettype");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<TicketTypeResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<TicketTypeResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting all ticket types via TicketSales API");
                throw new InvalidOperationException("Failed to get ticket types via microservice", ex);
            }
        }

        public async Task<IEnumerable<TicketTypeResponseDto>> GetByZoneIdAsync(int zoneId)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync($"/api/tickettype/zone/{zoneId}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<TicketTypeResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<TicketTypeResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting ticket types by zone via TicketSales API");
                throw new InvalidOperationException("Failed to get ticket types by zone via microservice", ex);
            }
        }

        public async Task<IEnumerable<TicketTypeResponseDto>> GetByEventIdAsync(int eventId)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync($"/api/tickettype/event/{eventId}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<TicketTypeResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<TicketTypeResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting ticket types by event via TicketSales API");
                throw new InvalidOperationException("Failed to get ticket types by event via microservice", ex);
            }
        }

        public async Task<IEnumerable<TicketTypeResponseDto>> GetByStatusAsync(TicketTypeStatus status)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync($"/api/tickettype/status/{status}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<TicketTypeResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<TicketTypeResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting ticket types by status via TicketSales API");
                throw new InvalidOperationException("Failed to get ticket types by status via microservice", ex);
            }
        }

        public async Task<IEnumerable<TicketTypeResponseDto>> GetAvailableTicketTypesAsync()
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync("/api/tickettype/available");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<TicketTypeResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<TicketTypeResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting available ticket types via TicketSales API");
                throw new InvalidOperationException("Failed to get available ticket types via microservice", ex);
            }
        }

        public async Task<IEnumerable<TicketTypeResponseDto>> GetByZoneAndEventAsync(int zoneId, int eventId)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync($"/api/tickettype/zone/{zoneId}/event/{eventId}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<TicketTypeResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<TicketTypeResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting ticket types by zone and event via TicketSales API");
                throw new InvalidOperationException("Failed to get ticket types via microservice", ex);
            }
        }

        public async Task<TicketTypeResponseDto?> UpdateTicketTypeAsync(int id, TicketTypeUpdateDto updateDto)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.PutAsJsonAsync($"/api/tickettype/{id}", updateDto);
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<TicketTypeResponseDto>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error updating ticket type via TicketSales API");
                throw new InvalidOperationException("Failed to update ticket type via microservice", ex);
            }
        }

        public async Task<bool> DeleteTicketTypeAsync(int id)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.DeleteAsync($"/api/tickettype/{id}");
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return false;
                response.EnsureSuccessStatusCode();
                return true;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error deleting ticket type via TicketSales API");
                throw new InvalidOperationException("Failed to delete ticket type via microservice", ex);
            }
        }

        public async Task<bool> UpdateAvailableQuantityAsync(int id, int quantity)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.PutAsJsonAsync($"/api/tickettype/{id}/quantity", quantity);
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return false;
                response.EnsureSuccessStatusCode();
                return true;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error updating ticket type quantity via TicketSales API");
                throw new InvalidOperationException("Failed to update quantity via microservice", ex);
            }
        }

        public async Task<int> GetTotalAvailableQuantityByEventAsync(int eventId)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync($"/api/tickettype/event/{eventId}/totalquantity");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<int>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting total available quantity via TicketSales API");
                throw new InvalidOperationException("Failed to get total quantity via microservice", ex);
            }
        }

        public async Task<bool> ReserveTicketsAsync(int id, int quantity)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.PostAsJsonAsync($"/api/tickettype/{id}/reserve", quantity);
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound ||
                    response.StatusCode == System.Net.HttpStatusCode.BadRequest) return false;
                response.EnsureSuccessStatusCode();
                return true;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error reserving tickets via TicketSales API");
                throw new InvalidOperationException("Failed to reserve tickets via microservice", ex);
            }
        }

        public async Task<bool> ReleaseTicketsAsync(int id, int quantity)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.PostAsJsonAsync($"/api/tickettype/{id}/release", quantity);
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return false;
                response.EnsureSuccessStatusCode();
                return true;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error releasing tickets via TicketSales API");
                throw new InvalidOperationException("Failed to release tickets via microservice", ex);
            }
        }
    }
}
