using MusicEventManagementSystem.API.Services.Proxies.IProxies;
using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;
using System.Text.Json;

namespace MusicEventManagementSystem.API.Services.Proxies
{
    public class SpecialOfferProxyService : ISpecialOfferProxyService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<SpecialOfferProxyService> _logger;
        private readonly JsonSerializerOptions _jsonOptions;

        public SpecialOfferProxyService(IHttpClientFactory httpClientFactory, ILogger<SpecialOfferProxyService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
            _jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        }

        public async Task<SpecialOfferResponseDto> CreateSpecialOfferAsync(SpecialOfferCreateDto createDto)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.PostAsJsonAsync("/api/specialoffers", createDto);
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<SpecialOfferResponseDto>(_jsonOptions)
                    ?? throw new InvalidOperationException("Failed to deserialize special offer response");
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error creating special offer via TicketSales API");
                throw new InvalidOperationException("Failed to create special offer via microservice", ex);
            }
        }

        public async Task<SpecialOfferResponseDto?> GetSpecialOfferByIdAsync(int id)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync($"/api/specialoffers/{id}");
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<SpecialOfferResponseDto>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting special offer {Id} via TicketSales API", id);
                throw new InvalidOperationException($"Failed to get special offer {id} via microservice", ex);
            }
        }

        public async Task<IEnumerable<SpecialOfferResponseDto>> GetAllSpecialOffersAsync()
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync("/api/specialoffers");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<SpecialOfferResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<SpecialOfferResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting all special offers via TicketSales API");
                throw new InvalidOperationException("Failed to get special offers via microservice", ex);
            }
        }

        public async Task<IEnumerable<SpecialOfferResponseDto>> GetActiveOffersAsync(DateTime currentDate)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync($"/api/specialoffers/active?currentDate={currentDate:o}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<SpecialOfferResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<SpecialOfferResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting active special offers via TicketSales API");
                throw new InvalidOperationException("Failed to get active offers via microservice", ex);
            }
        }

        public async Task<IEnumerable<SpecialOfferResponseDto>> GetByOfferTypeAsync(OfferType offerType)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync($"/api/specialoffers/by-type/{offerType}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<SpecialOfferResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<SpecialOfferResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting special offers by type via TicketSales API");
                throw new InvalidOperationException("Failed to get offers by type via microservice", ex);
            }
        }

        public async Task<IEnumerable<SpecialOfferResponseDto>> GetByDateRangeAsync(DateTime start, DateTime end)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync($"/api/specialoffers/date-range?start={start:o}&end={end:o}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<SpecialOfferResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<SpecialOfferResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting special offers by date range via TicketSales API");
                throw new InvalidOperationException("Failed to get offers by date range via microservice", ex);
            }
        }

        public async Task<IEnumerable<SpecialOfferResponseDto>> GetByTicketTypeAsync(int ticketTypeId)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync($"/api/specialoffers/by-ticket-type/{ticketTypeId}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<IEnumerable<SpecialOfferResponseDto>>(_jsonOptions)
                    ?? Enumerable.Empty<SpecialOfferResponseDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error getting special offers by ticket type via TicketSales API");
                throw new InvalidOperationException("Failed to get offers by ticket type via microservice", ex);
            }
        }

        public async Task<SpecialOfferResponseDto?> UpdateSpecialOfferAsync(int id, SpecialOfferUpdateDto updateDto)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.PutAsJsonAsync($"/api/specialoffers/{id}", updateDto);
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<SpecialOfferResponseDto>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error updating special offer via TicketSales API");
                throw new InvalidOperationException("Failed to update special offer via microservice", ex);
            }
        }

        public async Task<bool> DeleteSpecialOfferAsync(int id)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.DeleteAsync($"/api/specialoffers/{id}");
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return false;
                response.EnsureSuccessStatusCode();
                return true;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error deleting special offer via TicketSales API");
                throw new InvalidOperationException("Failed to delete special offer via microservice", ex);
            }
        }

        public async Task<bool> IsOfferValidAsync(int specialOfferId, DateTime checkDate)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync($"/api/specialoffers/{specialOfferId}/is-valid?checkDate={checkDate:o}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<bool>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error checking offer validity via TicketSales API");
                throw new InvalidOperationException("Failed to check offer validity via microservice", ex);
            }
        }

        public async Task<bool> HasActiveOfferForTicketTypeAsync(int ticketTypeId, DateTime currentDate)
        {
            var client = _httpClientFactory.CreateClient("TicketSalesAPI");
            try
            {
                var response = await client.GetAsync($"/api/specialoffers/has-active/{ticketTypeId}?currentDate={currentDate:o}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<bool>(_jsonOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error checking active offer via TicketSales API");
                throw new InvalidOperationException("Failed to check active offer via microservice", ex);
            }
        }
    }
}
