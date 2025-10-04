using MusicEventManagementSystem.API.Services.Proxies.IProxies;
using MusicEventManagementSystem.Core.Models.DTOs.EventOrganization;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;
using System.Text.Json;

namespace MusicEventManagementSystem.API.Services.Proxies
{
    public class VenueProxyService : IVenueProxyService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<VenueProxyService> _logger;
        private readonly JsonSerializerOptions _jsonOptions;

        public VenueProxyService(IHttpClientFactory httpClientFactory, ILogger<VenueProxyService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
            _jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        }

        public async Task<VenueResponseDto> CreateVenueAsync(VenueCreateDto venueDto)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.PostAsJsonAsync("/api/venues", venueDto);
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<VenueResponseDto>(_jsonOptions)
                    ?? throw new InvalidOperationException("Failed to deserialize venue response");
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error creating venue via TicketSales API");
                throw new InvalidOperationException("Failed to create venue via microservice", ex);
            }
        }

        public async Task<VenueResponseDto?> GetVenueByIdAsync(int id)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync($"/api/venues/{id}");
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<VenueResponseDto>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting venue {Id} via TicketSales API", id);
                throw new InvalidOperationException($"Failed to get venue {id} via microservice", ex);
            }
        }

        public async Task<IEnumerable<VenueResponseDto>> GetAllVenuesAsync()
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync("/api/venues");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<VenueResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<VenueResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting all venues via TicketSales API");
                throw new InvalidOperationException("Failed to get venues via microservice", ex);
            }
        }

        public async Task<IEnumerable<VenueResponseDto>> GetByCityAsync(string city)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync($"/api/venues/by-city/{Uri.EscapeDataString(city)}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<VenueResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<VenueResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting venues by city via TicketSales API");
                throw new InvalidOperationException("Failed to get venues by city via microservice", ex);
            }
        }

        public async Task<IEnumerable<VenueResponseDto>> GetByCapacityRangeAsync(int min, int max)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync($"/api/venues/capacity-range?min={min}&max={max}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<VenueResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<VenueResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting venues by capacity range via TicketSales API");
                throw new InvalidOperationException("Failed to get venues by capacity range via microservice", ex);
            }
        }

        public async Task<IEnumerable<VenueResponseDto>> GetByEventIdAsync(int eventId)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync($"/api/venues/by-event/{eventId}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<VenueResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<VenueResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting venues by event via TicketSales API");
                throw new InvalidOperationException("Failed to get venues by event via microservice", ex);
            }
        }

        public async Task<VenueResponseDto?> UpdateVenueAsync(int id, VenueUpdateDto venueDto)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.PutAsJsonAsync($"/api/venues/{id}", venueDto);
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<VenueResponseDto>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error updating venue via TicketSales API");
                throw new InvalidOperationException("Failed to update venue via microservice", ex);
            }
        }

        public async Task<bool> DeleteVenueAsync(int venueId)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.DeleteAsync($"/api/venues/{venueId}");
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return false;
                response.EnsureSuccessStatusCode();
                return true;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error deleting venue via TicketSales API");
                throw new InvalidOperationException("Failed to delete venue via microservice", ex);
            }
        }

        public async Task<IEnumerable<SegmentResponseDto>> GetSegmentsAsync(int venueId)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync($"/api/venues/{venueId}/segments");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<SegmentResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<SegmentResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting segments for venue via TicketSales API");
                throw new InvalidOperationException("Failed to get segments via microservice", ex);
            }
        }

        public async Task<IEnumerable<PerformanceResponseDto>> GetPerformancesAsync(int venueId)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync($"/api/venues/{venueId}/performances");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<PerformanceResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<PerformanceResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting performances for venue via TicketSales API");
                throw new InvalidOperationException("Failed to get performances via microservice", ex);
            }
        }

        public async Task<int> CalculateTotalCapacityAsync(int venueId)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync($"/api/venues/{venueId}/total-capacity");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<int>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error calculating total capacity via TicketSales API");
                throw new InvalidOperationException("Failed to calculate capacity via microservice", ex);
            }
        }
    }
}
