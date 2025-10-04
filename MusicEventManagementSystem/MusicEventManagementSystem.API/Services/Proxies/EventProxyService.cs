using MusicEventManagementSystem.API.Services.Proxies.IProxies;
using MusicEventManagementSystem.Core.Enums.EventOrganization;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.DTOs.EventOrganization;
using System.Text.Json;

namespace MusicEventManagementSystem.API.Services.Proxies
{
    public class EventProxyService : IEventProxyService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<EventProxyService> _logger;
        private readonly JsonSerializerOptions _jsonOptions;

        public EventProxyService(IHttpClientFactory httpClientFactory, ILogger<EventProxyService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
            _jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        }

        public async Task<EventResponseDto> CreateEventAsync(EventCreateDto eventDto)
        {
            var client = _httpClientFactory.CreateClient("EventOrganizationAPI");
            try
            {
                var response = await client.PostAsJsonAsync("/api/events", eventDto);
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<EventResponseDto>(_jsonOptions)
                    ?? throw new InvalidOperationException("Failed to deserialize event response");
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error calling EventOrganization API to create event");
                throw new InvalidOperationException("Failed to create event via microservice", ex);
            }
        }

        public async Task<EventResponseDto?> GetEventByIdAsync(int eventId)
        {
            var client = _httpClientFactory.CreateClient("EventOrganizationAPI");
            try
            {
                var response = await client.GetAsync($"/api/events/{eventId}");
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<EventResponseDto>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error calling EventOrganization API to get event {EventId}", eventId);
                throw new InvalidOperationException($"Failed to get event {eventId} via microservice", ex);
            }
        }

        public async Task<IEnumerable<EventResponseDto>> GetAllEventsAsync()
        {
            var client = _httpClientFactory.CreateClient("EventOrganizationAPI");
            try
            {
                var response = await client.GetAsync("/api/events");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<EventResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<EventResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error calling EventOrganization API to get all events");
                throw new InvalidOperationException("Failed to get events via microservice", ex);
            }
        }

        public async Task<IEnumerable<EventResponseDto>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            var client = _httpClientFactory.CreateClient("EventOrganizationAPI");
            try
            {
                var response = await client.GetAsync($"/api/events/date-range?startDate={startDate:o}&endDate={endDate:o}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<EventResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<EventResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error calling EventOrganization API to get events by date range");
                throw new InvalidOperationException("Failed to get events by date range via microservice", ex);
            }
        }

        public async Task<EventResponseDto> UpdateEventAsync(int eventId, EventUpdateDto eventDto)
        {
            var client = _httpClientFactory.CreateClient("EventOrganizationAPI");
            try
            {
                var response = await client.PutAsJsonAsync($"/api/events/{eventId}", eventDto);
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<EventResponseDto>(_jsonOptions)
                    ?? throw new InvalidOperationException("Failed to deserialize updated event response");
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error calling EventOrganization API to update event {EventId}", eventId);
                throw new InvalidOperationException($"Failed to update event {eventId} via microservice", ex);
            }
        }

        public async Task<bool> DeleteEventAsync(int eventId)
        {
            var client = _httpClientFactory.CreateClient("EventOrganizationAPI");
            try
            {
                var response = await client.DeleteAsync($"/api/events/{eventId}");
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return false;
                response.EnsureSuccessStatusCode();
                return true;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error calling EventOrganization API to delete event {EventId}", eventId);
                throw new InvalidOperationException($"Failed to delete event {eventId} via microservice", ex);
            }
        }

        public async Task<EventResponseDto?> GetByNameAsync(string name)
        {
            var client = _httpClientFactory.CreateClient("EventOrganizationAPI");
            try
            {
                var response = await client.GetAsync($"/api/events/by-name/{Uri.EscapeDataString(name)}");
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<EventResponseDto>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error calling EventOrganization API to get event by name");
                throw new InvalidOperationException("Failed to get event by name via microservice", ex);
            }
        }

        public async Task<IEnumerable<EventResponseDto>> GetByStatusAsync(EventStatus status)
        {
            var client = _httpClientFactory.CreateClient("EventOrganizationAPI");
            try
            {
                var response = await client.GetAsync($"/api/events/by-status/{status}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<EventResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<EventResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error calling EventOrganization API to get events by status");
                throw new InvalidOperationException("Failed to get events by status via microservice", ex);
            }
        }

        public async Task<IEnumerable<EventResponseDto>> GetByCreatedByIdAsync(Guid createdById)
        {
            var client = _httpClientFactory.CreateClient("EventOrganizationAPI");
            try
            {
                var response = await client.GetAsync($"/api/events/by-creator/{createdById}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<EventResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<EventResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error calling EventOrganization API to get events by creator");
                throw new InvalidOperationException("Failed to get events by creator via microservice", ex);
            }
        }
    }

}
