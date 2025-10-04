using MusicEventManagementSystem.API.Services.Proxies.IProxies;
using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;
using System.Text.Json;

namespace MusicEventManagementSystem.API.Services.Proxies
{
    public class ZoneProxyService : IZoneProxyService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<ZoneProxyService> _logger;
        private readonly JsonSerializerOptions _jsonOptions;

        public ZoneProxyService(IHttpClientFactory httpClientFactory, ILogger<ZoneProxyService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
            _jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        }

        public async Task<ZoneResponseDto> CreateZoneAsync(ZoneCreateDto zoneDto)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.PostAsJsonAsync("/api/zone", zoneDto);
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<ZoneResponseDto>(_jsonOptions)
                    ?? throw new InvalidOperationException("Failed to deserialize zone response");
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error creating zone via TicketSales API");
                throw new InvalidOperationException("Failed to create zone via microservice", ex);
            }
        }

        public async Task<ZoneResponseDto?> GetZoneByIdAsync(int id)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync($"/api/zone/{id}");
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<ZoneResponseDto>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting zone {Id} via TicketSales API", id);
                throw new InvalidOperationException($"Failed to get zone {id} via microservice", ex);
            }
        }

        public async Task<IEnumerable<ZoneResponseDto>> GetAllZonesAsync()
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync("/api/zone");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<ZoneResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<ZoneResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting all zones via TicketSales API");
                throw new InvalidOperationException("Failed to get zones via microservice", ex);
            }
        }

        public async Task<IEnumerable<ZoneResponseDto>> GetBySegmentIdAsync(int segmentId)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync($"/api/zone/segment/{segmentId}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<ZoneResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<ZoneResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting zones by segment via TicketSales API");
                throw new InvalidOperationException("Failed to get zones by segment via microservice", ex);
            }
        }

        public async Task<IEnumerable<ZoneResponseDto>> GetByPriceRangeAsync(decimal min, decimal max)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync($"/api/zone/price?min={min}&max={max}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<ZoneResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<ZoneResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting zones by price range via TicketSales API");
                throw new InvalidOperationException("Failed to get zones by price range via microservice", ex);
            }
        }

        public async Task<IEnumerable<ZoneResponseDto>> GetByPositionAsync(ZonePosition position)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync($"/api/zone/by-position/{position}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<ZoneResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<ZoneResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting zones by position via TicketSales API");
                throw new InvalidOperationException("Failed to get zones by position via microservice", ex);
            }
        }

        public async Task<ZoneResponseDto?> UpdateZoneAsync(int id, ZoneUpdateDto zoneDto)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.PutAsJsonAsync($"/api/zone/{id}", zoneDto);
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<ZoneResponseDto>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error updating zone via TicketSales API");
                throw new InvalidOperationException("Failed to update zone via microservice", ex);
            }
        }

        public async Task<bool> DeleteZoneAsync(int id)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.DeleteAsync($"/api/zone/{id}");
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return false;
                response.EnsureSuccessStatusCode();
                return true;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error deleting zone via TicketSales API");
                throw new InvalidOperationException("Failed to delete zone via microservice", ex);
            }
        }

        public async Task<IEnumerable<TicketTypeResponseDto>> GetTicketTypesAsync(int zoneId)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync($"/api/zone/{zoneId}/tickettypes");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<TicketTypeResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<TicketTypeResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting ticket types for zone via TicketSales API");
                throw new InvalidOperationException("Failed to get ticket types via microservice", ex);
            }
        }
    }
}
