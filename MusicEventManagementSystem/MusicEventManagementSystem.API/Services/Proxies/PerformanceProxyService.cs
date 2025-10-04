using MusicEventManagementSystem.API.Services.Proxies.IProxies;
using MusicEventManagementSystem.Core.Models.DTOs.EventOrganization;
using System.Text.Json;

namespace MusicEventManagementSystem.API.Services.Proxies
{
    public class PerformanceProxyService : IPerformanceProxyService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<PerformanceProxyService> _logger;
        private readonly JsonSerializerOptions _jsonOptions;

        public PerformanceProxyService(IHttpClientFactory httpClientFactory, ILogger<PerformanceProxyService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
            _jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        }

        public async Task<PerformanceResponseDto> CreatePerformanceAsync(PerformanceCreateDto performanceDto)
        {
            var client = _httpClientFactory.CreateClient("EventOrganizationAPI");
            try
            {
                var response = await client.PostAsJsonAsync("/api/performances", performanceDto);
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<PerformanceResponseDto>(_jsonOptions)
                    ?? throw new InvalidOperationException("Failed to deserialize performance response");
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error creating performance via EventOrganization API");
                throw new InvalidOperationException("Failed to create performance via microservice", ex);
            }
        }

        public async Task<PerformanceResponseDto?> GetPerformanceByIdAsync(int id)
        {
            var client = _httpClientFactory.CreateClient("EventOrganizationAPI");
            try
            {
                var response = await client.GetAsync($"/api/performances/{id}");
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<PerformanceResponseDto>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting performance {Id} via EventOrganization API", id);
                throw new InvalidOperationException($"Failed to get performance {id} via microservice", ex);
            }
        }

        public async Task<IEnumerable<PerformanceResponseDto>> GetAllPerformancesAsync()
        {
            var client = _httpClientFactory.CreateClient("EventOrganizationAPI");
            try
            {
                var response = await client.GetAsync("/api/performances");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<PerformanceResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<PerformanceResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting all performances via EventOrganization API");
                throw new InvalidOperationException("Failed to get performances via microservice", ex);
            }
        }

        public async Task<IEnumerable<PerformanceResponseDto>> GetByPerformerIdAsync(int performerId)
        {
            var client = _httpClientFactory.CreateClient("EventOrganizationAPI");
            try
            {
                var response = await client.GetAsync($"/api/performances/by-performer/{performerId}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<PerformanceResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<PerformanceResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting performances by performer via EventOrganization API");
                throw new InvalidOperationException("Failed to get performances by performer via microservice", ex);
            }
        }

        public async Task<IEnumerable<PerformanceResponseDto>> GetByVenueIdAsync(int venueId)
        {
            var client = _httpClientFactory.CreateClient("EventOrganizationAPI");
            try
            {
                var response = await client.GetAsync($"/api/performances/by-venue/{venueId}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<PerformanceResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<PerformanceResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting performances by venue via EventOrganization API");
                throw new InvalidOperationException("Failed to get performances by venue via microservice", ex);
            }
        }

        public async Task<IEnumerable<PerformanceResponseDto>> GetByDateRangeAsync(DateTime start, DateTime end)
        {
            var client = _httpClientFactory.CreateClient("EventOrganizationAPI");
            try
            {
                var response = await client.GetAsync($"/api/performances/date-range?start={start:o}&end={end:o}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<PerformanceResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<PerformanceResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting performances by date range via EventOrganization API");
                throw new InvalidOperationException("Failed to get performances by date range via microservice", ex);
            }
        }

        public async Task<PerformanceResponseDto?> UpdatePerformanceAsync(int id, PerformanceUpdateDto performanceDto)
        {
            var client = _httpClientFactory.CreateClient("EventOrganizationAPI");
            try
            {
                var response = await client.PutAsJsonAsync($"/api/performances/{id}", performanceDto);
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<PerformanceResponseDto>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error updating performance via EventOrganization API");
                throw new InvalidOperationException("Failed to update performance via microservice", ex);
            }
        }

        public async Task<bool> DeletePerformanceAsync(int id)
        {
            var client = _httpClientFactory.CreateClient("EventOrganizationAPI");
            try
            {
                var response = await client.DeleteAsync($"/api/performances/{id}");
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return false;
                response.EnsureSuccessStatusCode();
                return true;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error deleting performance via EventOrganization API");
                throw new InvalidOperationException("Failed to delete performance via microservice", ex);
            }
        }
    }
}
