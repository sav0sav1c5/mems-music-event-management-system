using MusicEventManagementSystem.API.Services.IServices;
using MusicEventManagementSystem.API.Services.Proxies.IProxies;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.DTOs.Client;

namespace MusicEventManagementSystem.API.Services
{
    public class ClientVenueService : IClientVenueService
    {
        private readonly IVenueProxyService _venueService;
        private readonly IEventProxyService _eventService;
        private readonly IPerformanceProxyService _performanceService;
        private readonly ITicketTypeProxyService _ticketTypeService;
        private readonly IZoneProxyService _zoneService;
        private readonly IPerformerProxyService _performerService;

        public ClientVenueService(
            IVenueProxyService venueService,
            IEventProxyService eventService,
            IPerformanceProxyService performanceService,
            ITicketTypeProxyService ticketTypeService,
            IZoneProxyService zoneService,
            IPerformerProxyService performerService)
        {
            _venueService = venueService;
            _eventService = eventService;
            _performanceService = performanceService;
            _ticketTypeService = ticketTypeService;
            _zoneService = zoneService;
            _performerService = performerService;
        }

        public async Task<IEnumerable<VenueInfoDto>> GetVenuesByCityAsync(string city)
        {
            var venues = await _venueService.GetByCityAsync(city);

            return venues.Select(v => new VenueInfoDto
            {
                VenueId = v.VenueId,
                Name = v.Name,
                City = v.City,
                Address = v.Address,
                Capacity = v.Capacity,
                VenueType = v.VenueType.ToString()
            });
        }

        public async Task<VenueInfoDto?> GetVenueDetailsAsync(int venueId)
        {
            var venue = await _venueService.GetVenueByIdAsync(venueId);

            if (venue == null)
            {
                return null;
            }

            return new VenueInfoDto
            {
                VenueId = venue.VenueId,
                Name = venue.Name,
                City = venue.City,
                Address = venue.Address,
                Capacity = venue.Capacity,
                VenueType = venue.VenueType.ToString()
            };
        }

        public async Task<IEnumerable<ClientEventDto>> GetVenueEventsAsync(int venueId)
        {
            var venue = await _venueService.GetVenueByIdAsync(venueId);

            if (venue == null)
            {
                return Enumerable.Empty<ClientEventDto>();
            }

            var evt = await _eventService.GetEventByIdAsync(venue.EventId);

            if (evt == null)
            {
                return Enumerable.Empty<ClientEventDto>();
            }

            // Get all venues for this event
            var venues = await _venueService.GetByEventIdAsync(evt.Id);
            var ticketTypes = await _ticketTypeService.GetByEventIdAsync(evt.Id);

            // Calculate price range
            var prices = new List<decimal>();
            foreach (var tt in ticketTypes)
            {
                var zone = await _zoneService.GetZoneByIdAsync(tt.ZoneId);
                if (zone != null)
                {
                    prices.Add(zone.BasePrice);
                }
            }

            // Get performer names
            var performerNames = new List<string>();
            foreach (var v in venues)
            {
                var performances = await _performanceService.GetByVenueIdAsync(v.VenueId);
                foreach (var perf in performances)
                {
                    var performer = await _performerService.GetPerformerByIdAsync(perf.PerformerId);
                    if (performer != null && !performerNames.Contains(performer.Name ?? ""))
                    {
                        performerNames.Add(performer.Name ?? "Unknown");
                    }
                }
            }

            var clientEvent = new ClientEventDto
            {
                Id = evt.Id,
                Name = evt.Name,
                Description = evt.Description,
                StartDate = evt.StartDate,
                EndDate = evt.EndDate,
                Status = evt.Status.ToString(),
                VenueNames = venues.Select(v => v.Name).ToList(),
                PerformerNames = performerNames,
                MinPrice = prices.Any() ? prices.Min() : 0,
                MaxPrice = prices.Any() ? prices.Max() : 0,
                TotalCapacity = venues.Sum(v => v.Capacity),
                AvailableTickets = ticketTypes.Sum(tt => tt.AvailableQuantity)
            };

            return new List<ClientEventDto> { clientEvent };
        }
    }
}
