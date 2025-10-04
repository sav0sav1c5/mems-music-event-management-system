using MusicEventManagementSystem.API.Services.Proxies.IProxies;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication;
using System.Text.Json;

namespace MusicEventManagementSystem.API.Services.Proxies
{
    public class PerformerProxyService : IPerformerProxyService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<PerformerProxyService> _logger;
        private readonly JsonSerializerOptions _jsonOptions;

        public PerformerProxyService(IHttpClientFactory httpClientFactory, IHttpContextAccessor httpContextAccessor, ILogger<PerformerProxyService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        }

        public async Task<PerformerResponseDto> CreatePerformerAsync(CreatePerformerDto performerDto)
        {
            var client = _httpClientFactory.CreateClient("PerformerCommunicationAPI");

            // Pass JWT token from incoming request to the outgoing request
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();

            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Add("Authorization", token);
            }

            try
            {
                var response = await client.PostAsJsonAsync("/api/performer", performerDto);
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<PerformerResponseDto>(_jsonOptions)
                    ?? throw new InvalidOperationException("Failed to deserialize performer response");
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error creating performer via EventOrganization API");
                throw new InvalidOperationException("Failed to create performer via microservice", ex);
            }
        }

        public async Task<PerformerResponseDto?> GetPerformerByIdAsync(int id)
        {
            var client = _httpClientFactory.CreateClient("PerformerCommunicationAPI");

            // Pass JWT token from incoming request to the outgoing request
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();

            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Add("Authorization", token);
            }

            try
            {
                var response = await client.GetAsync($"/api/performer/{id}");
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<PerformerResponseDto>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting performer {Id} via EventOrganization API", id);
                throw new InvalidOperationException($"Failed to get performer {id} via microservice", ex);
            }
        }

        public async Task<IEnumerable<PerformerResponseDto>> GetAllPerformersAsync()
        {
            var client = _httpClientFactory.CreateClient("PerformerCommunicationAPI");

            // Pass JWT token from incoming request to the outgoing request
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();

            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Add("Authorization", token);
            }

            try
            {
                var response = await client.GetAsync("/api/performer");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<PerformerResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<PerformerResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting all performers via EventOrganization API");
                throw new InvalidOperationException("Failed to get performers via microservice", ex);
            }
        }

        public async Task<PerformerResponseDto?> GetByNameAsync(string name)
        {
            var client = _httpClientFactory.CreateClient("PerformerCommunicationAPI");

            // Pass JWT token from incoming request to the outgoing request
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();

            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Add("Authorization", token);
            }

            try
            {
                var response = await client.GetAsync($"/api/performer/by-name/{Uri.EscapeDataString(name)}");
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<PerformerResponseDto>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting performer by name via EventOrganization API");
                throw new InvalidOperationException("Failed to get performer by name via microservice", ex);
            }
        }

        public async Task<IEnumerable<PerformerResponseDto>> GetByGenreAsync(string genre)
        {
            var client = _httpClientFactory.CreateClient("PerformerCommunicationAPI");

            // Pass JWT token from incoming request to the outgoing request
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();

            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Add("Authorization", token);
            }

            try
            {
                var response = await client.GetAsync($"/api/performer/by-genre/{Uri.EscapeDataString(genre)}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<PerformerResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<PerformerResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting performers by genre via EventOrganization API");
                throw new InvalidOperationException("Failed to get performers by genre via microservice", ex);
            }
        }

        public async Task<PerformerResponseDto?> UpdatePerformerAsync(int id, UpdatePerformerDto performerDto)
        {
            var client = _httpClientFactory.CreateClient("PerformerCommunicationAPI");

            // Pass JWT token from incoming request to the outgoing request
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();

            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Add("Authorization", token);
            }

            try
            {
                var response = await client.PutAsJsonAsync($"/api/performer/{id}", performerDto);
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<PerformerResponseDto>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error updating performer via EventOrganization API");
                throw new InvalidOperationException("Failed to update performer via microservice", ex);
            }
        }

        public async Task<bool> DeletePerformerAsync(int id)
        {
            var client = _httpClientFactory.CreateClient("PerformerCommunicationAPI");

            // Pass JWT token from incoming request to the outgoing request
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();

            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Add("Authorization", token);
            }

            try
            {
                var response = await client.DeleteAsync($"/api/performer/{id}");
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return false;
                response.EnsureSuccessStatusCode();
                return true;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error deleting performer via EventOrganization API");
                throw new InvalidOperationException("Failed to delete performer via microservice", ex);
            }
        }
    }
}