using MusicEventManagementSystem.API.Services.IServices;
using MusicEventManagementSystem.API.Services.Proxies.IProxies;
using MusicEventManagementSystem.Core.Enums.EventOrganization;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.DTOs.Client;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;

namespace MusicEventManagementSystem.API.Services
{
    public class ClientEventService : IClientEventService
    {
        private readonly IEventProxyService _eventService;
        private readonly IVenueProxyService _venueService;
        private readonly IPerformanceProxyService _performanceService;
        private readonly IPerformerProxyService _performerService;
        private readonly ITicketTypeProxyService _ticketTypeService;
        private readonly IZoneProxyService _zoneService;
        private readonly ISpecialOfferProxyService _specialOfferService;

        public ClientEventService(
            IEventProxyService eventService,
            IVenueProxyService venueService,
            IPerformanceProxyService performanceService,
            IPerformerProxyService performerService,
            ITicketTypeProxyService ticketTypeService,
            IZoneProxyService zoneService,
            ISpecialOfferProxyService specialOfferService)
        {
            _eventService = eventService;
            _venueService = venueService;
            _performanceService = performanceService;
            _performerService = performerService;
            _ticketTypeService = ticketTypeService;
            _zoneService = zoneService;
            _specialOfferService = specialOfferService;
        }

        public async Task<IEnumerable<ClientEventDto>> GetUpcomingEventsAsync()
        {
            var now = DateTime.UtcNow;
            var futureDate = now.AddMonths(6);

            var events = await _eventService.GetByDateRangeAsync(now, futureDate);
            var publishedEvents = events.Where(e => e.Status == EventStatus.Planned);

            var clientEvents = new List<ClientEventDto>();

            foreach (var evt in publishedEvents)
            {
                var clientEvent = await MapToClientEventDto(evt.Id);
                if (clientEvent != null)
                {
                    clientEvents.Add(clientEvent);
                }
            }

            return clientEvents.OrderBy(e => e.StartDate);
        }

        public async Task<EventDetailsDto?> GetEventDetailsAsync(int eventId)
        {
            var evt = await _eventService.GetEventByIdAsync(eventId);
            if (evt == null || evt.Status != EventStatus.Planned)
            {
                return null;
            }

            var venues = await _venueService.GetByEventIdAsync(eventId);
            var ticketTypes = await _ticketTypeService.GetByEventIdAsync(eventId);

            // Build venue info
            var venueInfoList = venues.Select(v => new VenueInfoDto
            {
                VenueId = v.VenueId,
                Name = v.Name,
                City = v.City,
                Address = v.Address,
                Capacity = v.Capacity,
                VenueType = v.VenueType.ToString()
            }).ToList();

            // Build performer info with performance times
            var performerInfoList = await GetPerformersForEventAsync(venues);

            // Build ticket zones with pricing
            var ticketZones = await BuildTicketZonesAsync(ticketTypes);

            return new EventDetailsDto
            {
                Id = evt.Id,
                Name = evt.Name,
                Description = evt.Description,
                StartDate = evt.StartDate,
                EndDate = evt.EndDate,
                Status = evt.Status.ToString(),
                Venues = venueInfoList,
                Performers = performerInfoList,
                TicketZones = ticketZones
            };
        }

        public async Task<IEnumerable<ClientEventDto>> SearchEventsAsync(
            string? keyword, DateTime? startDate, DateTime? endDate)
        {
            var allEvents = await GetUpcomingEventsAsync();

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                keyword = keyword.ToLower();
                allEvents = allEvents.Where(e =>
                    (e.Name?.ToLower().Contains(keyword) ?? false) ||
                    (e.Description?.ToLower().Contains(keyword) ?? false) ||
                    (e.PerformerNames?.Any(p => p.ToLower().Contains(keyword)) ?? false) ||
                    (e.VenueNames?.Any(v => v.ToLower().Contains(keyword)) ?? false)
                );
            }

            if (startDate.HasValue)
            {
                allEvents = allEvents.Where(e => e.StartDate >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                allEvents = allEvents.Where(e => e.EndDate <= endDate.Value);
            }

            return allEvents;
        }

        public async Task<IEnumerable<ClientEventDto>> GetEventsByPerformerAsync(int performerId)
        {
            var performances = await _performanceService.GetByPerformerIdAsync(performerId);
            var venueIds = performances.Select(p => p.VenueId).Distinct();

            var eventIds = new HashSet<int>();
            foreach (var venueId in venueIds)
            {
                var venue = await _venueService.GetVenueByIdAsync(venueId);
                if (venue != null)
                {
                    eventIds.Add(venue.EventId);
                }
            }

            var allEvents = await GetUpcomingEventsAsync();
            return allEvents.Where(e => eventIds.Contains(e.Id));
        }

        public async Task<IEnumerable<ClientEventDto>> GetEventsByCityAsync(string city)
        {
            var venues = await _venueService.GetByCityAsync(city);
            var eventIds = venues.Select(v => v.EventId).Distinct();

            var allEvents = await GetUpcomingEventsAsync();
            return allEvents.Where(e => eventIds.Contains(e.Id));
        }

        public async Task<IEnumerable<ClientEventDto>> GetFeaturedEventsAsync()
        {
            var upcomingEvents = await GetUpcomingEventsAsync();

            // Featured logic: events with most available tickets or highest popularity
            return upcomingEvents
                .OrderByDescending(e => e.AvailableTickets)
                .Take(6);
        }

        // Helper methods
        private async Task<ClientEventDto?> MapToClientEventDto(int eventId)
        {
            var evt = await _eventService.GetEventByIdAsync(eventId);
            if (evt == null)
            {
                return null;
            }

            var venues = await _venueService.GetByEventIdAsync(eventId);
            var ticketTypes = await _ticketTypeService.GetByEventIdAsync(eventId);

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
            foreach (var venue in venues)
            {
                var performances = await _performanceService.GetByVenueIdAsync(venue.VenueId);
                foreach (var perf in performances)
                {
                    var performer = await _performerService.GetPerformerByIdAsync(perf.PerformerId);
                    if (performer != null && !performerNames.Contains(performer.Name ?? ""))
                    {
                        performerNames.Add(performer.Name ?? "Unknown");
                    }
                }
            }

            return new ClientEventDto
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
        }

        private async Task<List<PerformerInfoDto>> GetPerformersForEventAsync(
            IEnumerable<VenueResponseDto> venues)
        {
            var performerInfoList = new List<PerformerInfoDto>();
            var processedPerformers = new HashSet<int>();

            foreach (var venue in venues)
            {
                var performances = await _performanceService.GetByVenueIdAsync(venue.VenueId);

                foreach (var performance in performances)
                {
                    if (processedPerformers.Contains(performance.PerformerId))
                    {
                        continue;
                    }

                    var performer = await _performerService.GetPerformerByIdAsync(performance.PerformerId);
                    if (performer != null)
                    {
                        performerInfoList.Add(new PerformerInfoDto
                        {
                            PerformerId = performer.PerformerId,
                            Name = performer.Name,
                            Genre = performer.Genre,
                            PerformanceStartTime = performance.StartTime,
                            PerformanceEndTime = performance.EndTime
                        });
                        processedPerformers.Add(performance.PerformerId);
                    }
                }
            }

            return performerInfoList;
        }

        private async Task<List<TicketZoneDto>> BuildTicketZonesAsync(
            IEnumerable<TicketTypeResponseDto> ticketTypes)
        {
            var zoneGroups = ticketTypes.GroupBy(tt => tt.ZoneId);
            var ticketZones = new List<TicketZoneDto>();
            var activeOffers = await _specialOfferService.GetActiveOffersAsync(DateTime.UtcNow);

            foreach (var group in zoneGroups)
            {
                var zone = await _zoneService.GetZoneByIdAsync(group.Key);
                if (zone == null) continue;

                var ticketTypeInfoList = new List<TicketTypeInfoDto>();

                foreach (var tt in group)
                {
                    var basePrice = zone.BasePrice;
                    var currentPrice = basePrice;

                    // Apply special offers
                    var hasOffer = false;
                    string? offerDescription = null;
                    decimal? discountPct = null;

                    var ttOffers = activeOffers.Where(o =>
                        o.TicketTypeIds?.Contains(tt.TicketTypeId) == true);

                    if (ttOffers.Any())
                    {
                        var offer = ttOffers.First();
                        hasOffer = true;
                        offerDescription = offer.Description;
                        discountPct = offer.DiscountValue;
                        currentPrice = basePrice * (1 - offer.DiscountValue / 100);
                    }

                    ticketTypeInfoList.Add(new TicketTypeInfoDto
                    {
                        TicketTypeId = tt.TicketTypeId,
                        Name = tt.Name,
                        Description = tt.Description,
                        BasePrice = basePrice,
                        CurrentPrice = currentPrice,
                        AvailableQuantity = tt.AvailableQuantity,
                        Status = tt.Status.ToString(),
                        HasSpecialOffer = hasOffer,
                        SpecialOfferDescription = offerDescription,
                        DiscountPercentage = discountPct
                    });
                }

                ticketZones.Add(new TicketZoneDto
                {
                    ZoneId = zone.ZoneId,
                    ZoneName = zone.Name,
                    ZoneDescription = zone.Description,
                    Position = zone.Position.ToString(),
                    TicketTypes = ticketTypeInfoList
                });
            }

            return ticketZones;
        }
    }
}
