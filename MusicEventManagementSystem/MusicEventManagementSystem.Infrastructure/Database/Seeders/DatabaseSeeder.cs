using Microsoft.EntityFrameworkCore;
using MusicEventManagementSystem.Core.Enums.Auth;
using MusicEventManagementSystem.Core.Enums.EventOrganization;
using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Models.Entities.Auth;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;

namespace MusicEventManagementSystem.Infrastructure.Database.Seeders
{
    public static class DatabaseSeeder
    {
        private static Random _random = new Random(42);

        public static async Task SeedAsync(ApplicationDbContext context)
        {
            if (context.Events.Any())
            {
                return; // Already seeded
            }

            Console.WriteLine("🌱 Starting Database Seeding...\n");

            // 1. Seed Users (fewer, more focused)
            var users = await SeedUsers(context);

            // 2. Seed Locations
            var locations = await SeedLocations(context);

            // 3. Seed Events (diverse statuses and dates)
            var events = await SeedEvents(context, users, locations);

            // 4. Seed Venues (multiple per event)
            var venues = await SeedVenues(context, events);

            // 5. Seed Segments & Zones
            var segments = await SeedSegments(context, venues);
            var zones = await SeedZones(context, segments);

            // 6. Seed Pricing Rules & Special Offers
            var pricingRules = await SeedPricingRules(context);
            var specialOffers = await SeedSpecialOffers(context);

            // 7. Seed Ticket Types
            var ticketTypes = await SeedTicketTypes(context, zones, events);

            // 8. Seed Performers
            var performers = await SeedPerformers(context);

            // 9. Seed Performances (some assigned, some unassigned)
            var performances = await SeedPerformances(context, performers, venues, events);

            // 10. Seed Tickets
            var tickets = await SeedTickets(context, ticketTypes, zones);

            // 11. Seed Recorded Sales (distributed across time including today)
            await SeedRecordedSales(context, tickets, specialOffers, users);

            // 12. Link Many-to-Many relationships
            await LinkRelationships(context, events, ticketTypes, pricingRules, specialOffers);

            Console.WriteLine("\n✅ Database Seeding Completed Successfully!");
        }

        private static async Task<List<ApplicationUser>> SeedUsers(ApplicationDbContext context)
        {
            var users = new List<ApplicationUser>
            {
                new ApplicationUser
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = "ana.petrovic@ticketsales.com",
                    Email = "ana.petrovic@ticketsales.com",
                    NormalizedUserName = "ANA.PETROVIC@TICKETSALES.COM",
                    NormalizedEmail = "ANA.PETROVIC@TICKETSALES.COM",
                    FirstName = "Ana",
                    LastName = "Petrović",
                    PhoneNumber = "+381641111111",
                    Department = Department.TicketSales,
                    EmailConfirmed = true,
                    CreatedAt = DateTime.UtcNow.AddMonths(-6),
                    IsActive = true
                },
                new ApplicationUser
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = "marko.jovic@events.com",
                    Email = "marko.jovic@events.com",
                    NormalizedUserName = "MARKO.JOVIC@EVENTS.COM",
                    NormalizedEmail = "MARKO.JOVIC@EVENTS.COM",
                    FirstName = "Marko",
                    LastName = "Jović",
                    PhoneNumber = "+381642222222",
                    Department = Department.EventOrganization,
                    EmailConfirmed = true,
                    CreatedAt = DateTime.UtcNow.AddMonths(-8),
                    IsActive = true
                },
                new ApplicationUser
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = "stefan.nikolic@artists.com",
                    Email = "stefan.nikolic@artists.com",
                    NormalizedUserName = "STEFAN.NIKOLIC@ARTISTS.COM",
                    NormalizedEmail = "STEFAN.NIKOLIC@ARTISTS.COM",
                    FirstName = "Stefan",
                    LastName = "Nikolić",
                    PhoneNumber = "+381643333333",
                    Department = Department.ArtistCommunication,
                    EmailConfirmed = true,
                    CreatedAt = DateTime.UtcNow.AddMonths(-4),
                    IsActive = true
                }
            };

            context.Users.AddRange(users);
            await context.SaveChangesAsync();
            Console.WriteLine($"✓ Created {users.Count} users");
            return users;
        }

        private static async Task<List<Location>> SeedLocations(ApplicationDbContext context)
        {
            var locations = new List<Location>
            {
                new Location { Name = "Belgrade" },
                new Location { Name = "Novi Sad" },
                new Location { Name = "Niš" }
            };

            context.Locations.AddRange(locations);
            await context.SaveChangesAsync();
            Console.WriteLine($"✓ Created {locations.Count} locations");
            return locations;
        }

        private static async Task<List<Event>> SeedEvents(ApplicationDbContext context, List<ApplicationUser> users, List<Location> locations)
        {
            var eventOrganizer = users.First(u => u.Department == Department.EventOrganization);

            var events = new List<Event>
            {
                // Past event (completed)
                new Event
                {
                    Name = "Winter Music Festival",
                    Description = "Amazing winter festival with top artists",
                    StartDate = DateTime.UtcNow.AddDays(-15),
                    EndDate = DateTime.UtcNow.AddDays(-14),
                    Status = EventStatus.Completed,
                    CreatedById = eventOrganizer.Id != null ? Guid.Parse(eventOrganizer.Id) : Guid.NewGuid(),
                    LocationId = 1,
                    CreatedAt = DateTime.UtcNow.AddMonths(-3),
                    UpdatedAt = DateTime.UtcNow.AddDays(-14)
                },
                // Current event (in progress)
                new Event
                {
                    Name = "Spring Electronic Weekend",
                    Description = "Multi-venue electronic music weekend",
                    StartDate = DateTime.UtcNow.AddDays(-1),
                    EndDate = DateTime.UtcNow.AddDays(2),
                    Status = EventStatus.InProgress,
                    CreatedById = Guid.Parse(eventOrganizer.Id),
                    LocationId = 1,
                    CreatedAt = DateTime.UtcNow.AddMonths(-2),
                    UpdatedAt = DateTime.UtcNow.AddDays(-1)
                },
                // Near future event (next week)
                new Event
                {
                    Name = "Jazz Night",
                    Description = "Intimate jazz evening",
                    StartDate = DateTime.UtcNow.AddDays(7),
                    EndDate = DateTime.UtcNow.AddDays(7),
                    Status = EventStatus.Planned,
                    CreatedById = Guid.Parse(eventOrganizer.Id),
                    LocationId = 1,
                    CreatedAt = DateTime.UtcNow.AddDays(-30),
                    UpdatedAt = DateTime.UtcNow.AddDays(-5)
                },
                // Future multi-day festival
                new Event
                {
                    Name = "Summer Rock Festival",
                    Description = "Three-day rock festival with multiple stages",
                    StartDate = DateTime.UtcNow.AddMonths(2),
                    EndDate = DateTime.UtcNow.AddMonths(2).AddDays(2),
                    Status = EventStatus.Planned,
                    CreatedById = Guid.Parse(eventOrganizer.Id),
                    LocationId = 2,
                    CreatedAt = DateTime.UtcNow.AddDays(-45),
                    UpdatedAt = DateTime.UtcNow.AddDays(-10)
                }
            };

            context.Events.AddRange(events);
            await context.SaveChangesAsync();
            Console.WriteLine($"✓ Created {events.Count} events with diverse statuses");
            return events;
        }

        private static async Task<List<Venue>> SeedVenues(ApplicationDbContext context, List<Event> events)
        {
            var venues = new List<Venue>
            {
                // Event 1 (Winter Festival) - Single venue
                new Venue
                {
                    Name = "Belgrade Arena",
                    Description = "Main indoor arena",
                    City = "Belgrade",
                    Address = "Bulevar Arsenija Čarnojevića 58",
                    Capacity = 15000,
                    VenueType = VenueType.Arena,
                    EventId = 1
                },
                
                // Event 2 (Electronic Weekend) - Multiple venues
                new Venue
                {
                    Name = "Stark Arena",
                    Description = "Large electronic venue",
                    City = "Belgrade",
                    Address = "Bulevar Milutina Milankovića",
                    Capacity = 12000,
                    VenueType = VenueType.Arena,
                    EventId = 2
                },
                new Venue
                {
                    Name = "Drugstore Club",
                    Description = "Underground electronic club",
                    City = "Belgrade",
                    Address = "Svetogorska 6",
                    Capacity = 800,
                    VenueType = VenueType.Club,
                    EventId = 2
                },
                
                // Event 3 (Jazz Night) - Single intimate venue
                new Venue
                {
                    Name = "Sava Center",
                    Description = "Concert hall for jazz",
                    City = "Belgrade",
                    Address = "Milentija Popovića 9",
                    Capacity = 3000,
                    VenueType = VenueType.Theater,
                    EventId = 3
                },
                
                // Event 4 (Rock Festival) - Multiple stages
                new Venue
                {
                    Name = "Main Stage",
                    Description = "Festival main stage",
                    City = "Novi Sad",
                    Address = "Petrovaradin Fortress",
                    Capacity = 30000,
                    VenueType = VenueType.Stadium,
                    EventId = 4
                },
                new Venue
                {
                    Name = "Alternative Stage",
                    Description = "Smaller alternative music stage",
                    City = "Novi Sad",
                    Address = "Petrovaradin Fortress - Alt",
                    Capacity = 8000,
                    VenueType = VenueType.Outdoor,
                    EventId = 4
                }
            };

            context.Venues.AddRange(venues);
            await context.SaveChangesAsync();
            Console.WriteLine($"✓ Created {venues.Count} venues (multiple venues per some events)");
            return venues;
        }

        private static async Task<List<Segment>> SeedSegments(ApplicationDbContext context, List<Venue> venues)
        {
            var segments = new List<Segment>
            {
                // Belgrade Arena segments
                new Segment { Name = "Floor", Capacity = 8000, SegmentType = SegmentType.Standing, VenueId = 1 },
                new Segment { Name = "Tribune", Capacity = 7000, SegmentType = SegmentType.Seated, VenueId = 1 },
                
                // Stark Arena segments
                new Segment { Name = "Floor", Capacity = 7000, SegmentType = SegmentType.Standing, VenueId = 2 },
                new Segment { Name = "Seats", Capacity = 5000, SegmentType = SegmentType.Seated, VenueId = 2 },
                
                // Drugstore segments
                new Segment { Name = "Main Floor", Capacity = 800, SegmentType = SegmentType.Standing, VenueId = 3 },
                
                // Sava Center segments
                new Segment { Name = "Orchestra", Capacity = 1500, SegmentType = SegmentType.Seated, VenueId = 4 },
                new Segment { Name = "Balcony", Capacity = 1500, SegmentType = SegmentType.Seated, VenueId = 4 },
                
                // Main Stage segments
                new Segment { Name = "Festival Ground", Capacity = 30000, SegmentType = SegmentType.Standing, VenueId = 5 },
                
                // Alternative Stage segments
                new Segment { Name = "Standing Area", Capacity = 8000, SegmentType = SegmentType.Standing, VenueId = 6 }
            };

            context.Segments.AddRange(segments);
            await context.SaveChangesAsync();
            Console.WriteLine($"✓ Created {segments.Count} segments");
            return segments;
        }

        private static async Task<List<Zone>> SeedZones(ApplicationDbContext context, List<Segment> segments)
        {
            var zones = new List<Zone>
            {
                // Belgrade Arena zones
                new Zone { Name = "Floor VIP", Capacity = 2000, BasePrice = 8000, Position = ZonePosition.Front, SegmentId = 1 },
                new Zone { Name = "Floor General", Capacity = 6000, BasePrice = 5000, Position = ZonePosition.Center, SegmentId = 1 },
                new Zone { Name = "Tribune Lower", Capacity = 4000, BasePrice = 4000, Position = ZonePosition.Lower, SegmentId = 2 },
                new Zone { Name = "Tribune Upper", Capacity = 3000, BasePrice = 3000, Position = ZonePosition.Upper, SegmentId = 2 },
                
                // Stark Arena zones
                new Zone { Name = "Golden Circle", Capacity = 1000, BasePrice = 10000, Position = ZonePosition.Front, SegmentId = 3 },
                new Zone { Name = "General Floor", Capacity = 6000, BasePrice = 6000, Position = ZonePosition.Center, SegmentId = 3 },
                new Zone { Name = "Seated Area", Capacity = 5000, BasePrice = 4500, Position = ZonePosition.Lower, SegmentId = 4 },
                
                // Drugstore zones
                new Zone { Name = "DJ Area", Capacity = 300, BasePrice = 2500, Position = ZonePosition.Front, SegmentId = 5 },
                new Zone { Name = "Dance Floor", Capacity = 500, BasePrice = 2000, Position = ZonePosition.Center, SegmentId = 5 },
                
                // Sava Center zones
                new Zone { Name = "Orchestra Premium", Capacity = 800, BasePrice = 5000, Position = ZonePosition.Front, SegmentId = 6 },
                new Zone { Name = "Orchestra Standard", Capacity = 700, BasePrice = 4000, Position = ZonePosition.Back, SegmentId = 6 },
                new Zone { Name = "Balcony", Capacity = 1500, BasePrice = 3500, Position = ZonePosition.Balcony, SegmentId = 7 },
                
                // Main Stage zones
                new Zone { Name = "Front Stage", Capacity = 8000, BasePrice = 12000, Position = ZonePosition.Front, SegmentId = 8 },
                new Zone { Name = "General Area", Capacity = 22000, BasePrice = 8000, Position = ZonePosition.Center, SegmentId = 8 },
                
                // Alternative Stage zones
                new Zone { Name = "Alt Stage Area", Capacity = 8000, BasePrice = 6000, Position = ZonePosition.Center, SegmentId = 9 }
            };

            context.Zones.AddRange(zones);
            await context.SaveChangesAsync();
            Console.WriteLine($"✓ Created {zones.Count} zones");
            return zones;
        }

        private static async Task<List<PricingRule>> SeedPricingRules(ApplicationDbContext context)
        {
            var rules = new List<PricingRule>
            {
                new PricingRule
                {
                    Name = "Standard Pricing",
                    Description = "Base pricing with early bird discount",
                    MinimumPrice = 1500,
                    MaximumPrice = 15000,
                    OccupancyPercentage1 = 50,
                    OccupancyPercentage2 = 80,
                    OccupancyThreshold1 = 1.2m,
                    OccupancyThreshold2 = 1.5m,
                    EarlyBirdPercentage = 20,
                    PricingCondition = PricingCondition.TimeBasedEarlyBird,
                    Modifier = 1.0m
                },
                new PricingRule
                {
                    Name = "VIP Premium",
                    Description = "Premium VIP pricing",
                    MinimumPrice = 5000,
                    MaximumPrice = 25000,
                    OccupancyPercentage1 = 40,
                    OccupancyPercentage2 = 70,
                    OccupancyThreshold1 = 1.5m,
                    OccupancyThreshold2 = 2.0m,
                    EarlyBirdPercentage = 15,
                    PricingCondition = PricingCondition.VIPUpgrade,
                    Modifier = 1.8m
                },
                new PricingRule
                {
                    Name = "Last Minute Deal",
                    Description = "Discounted last minute tickets",
                    MinimumPrice = 1000,
                    MaximumPrice = 8000,
                    OccupancyPercentage1 = 30,
                    OccupancyPercentage2 = 60,
                    OccupancyThreshold1 = 0.8m,
                    OccupancyThreshold2 = 1.0m,
                    EarlyBirdPercentage = 0,
                    PricingCondition = PricingCondition.LastMinute,
                    Modifier = 0.7m
                }
            };

            context.PricingRules.AddRange(rules);
            await context.SaveChangesAsync();
            Console.WriteLine($"✓ Created {rules.Count} pricing rules");
            return rules;
        }

        private static async Task<List<SpecialOffer>> SeedSpecialOffers(ApplicationDbContext context)
        {
            var offers = new List<SpecialOffer>
            {
                new SpecialOffer
                {
                    Name = "Early Bird 25%",
                    Description = "Early booking discount",
                    StartDate = DateTime.UtcNow.AddMonths(-1),
                    EndDate = DateTime.UtcNow.AddMonths(1),
                    ApplicationCondition = "First 500 tickets",
                    DiscountValue = 25,
                    TicketLimit = 500,
                    OfferType = OfferType.EarlyBird
                },
                new SpecialOffer
                {
                    Name = "Student Discount",
                    Description = "Valid student ID required",
                    StartDate = DateTime.UtcNow,
                    EndDate = DateTime.UtcNow.AddMonths(3),
                    ApplicationCondition = "Student ID required",
                    DiscountValue = 15,
                    TicketLimit = 300,
                    OfferType = OfferType.StudentDiscount
                },
                new SpecialOffer
                {
                    Name = "Group Deal 5+",
                    Description = "5 or more tickets",
                    StartDate = DateTime.UtcNow,
                    EndDate = DateTime.UtcNow.AddMonths(2),
                    ApplicationCondition = "Minimum 5 tickets",
                    DiscountValue = 20,
                    TicketLimit = 200,
                    OfferType = OfferType.GroupDiscount
                }
            };

            context.SpecialOffers.AddRange(offers);
            await context.SaveChangesAsync();
            Console.WriteLine($"✓ Created {offers.Count} special offers");
            return offers;
        }

        private static async Task<List<TicketType>> SeedTicketTypes(ApplicationDbContext context, List<Zone> zones, List<Event> events)
        {
            var ticketTypes = new List<TicketType>();

            // Create ticket types for each zone
            foreach (var zone in zones)
            {
                var venue = context.Venues.Include(v => v.Event).First(v => v.Segments.Any(s => s.Zones.Any(z => z.ZoneId == zone.ZoneId)));

                ticketTypes.Add(new TicketType
                {
                    Name = $"{zone.Name} - {venue.Name}",
                    Description = $"Access to {zone.Name}",
                    AvailableQuantity = (int)(zone.Capacity * 0.95), // 95% of capacity available
                    Status = venue.Event.Status == EventStatus.Completed ? TicketTypeStatus.Inactive : TicketTypeStatus.Active,
                    ZoneId = zone.ZoneId,
                    EventId = venue.EventId
                });
            }

            context.TicketTypes.AddRange(ticketTypes);
            await context.SaveChangesAsync();
            Console.WriteLine($"✓ Created {ticketTypes.Count} ticket types");
            return ticketTypes;
        }

        private static async Task<List<Performer>> SeedPerformers(ApplicationDbContext context)
        {
            var performers = new List<Performer>
            {
                new Performer
                {
                    Name = "The Midnight Sons",
                    Email = "booking@midnightsons.com",
                    Contact = "+44 20 1234 5678",
                    Genre = "Rock",
                    Popularity = 85,
                    TechnicalRequirements = "Full band setup, 32-channel mixer",
                    MinPrice = 80000,
                    MaxPrice = 150000,
                    AverageResponseTime = TimeSpan.FromHours(24),
                    Status = "Available",
                    UpdatedAt = DateTime.UtcNow
                },
                new Performer
                {
                    Name = "DJ Stellar",
                    Email = "contact@djstellar.com",
                    Contact = "+49 30 9876 5432",
                    Genre = "Electronic",
                    Popularity = 78,
                    TechnicalRequirements = "CDJ setup, smoke machine",
                    MinPrice = 35000,
                    MaxPrice = 75000,
                    AverageResponseTime = TimeSpan.FromHours(12),
                    Status = "Available",
                    UpdatedAt = DateTime.UtcNow
                },
                new Performer
                {
                    Name = "Marija Jovanović Trio",
                    Email = "info@marijajazz.rs",
                    Contact = "+381 11 234 5678",
                    Genre = "Jazz",
                    Popularity = 68,
                    TechnicalRequirements = "Piano, drums, bass amp",
                    MinPrice = 12000,
                    MaxPrice = 30000,
                    AverageResponseTime = TimeSpan.FromHours(36),
                    Status = "Available",
                    UpdatedAt = DateTime.UtcNow
                },
                new Performer
                {
                    Name = "Electric Pulse",
                    Email = "booking@electricpulse.com",
                    Contact = "+1 310 555 0199",
                    Genre = "Electronic",
                    Popularity = 82,
                    TechnicalRequirements = "Full electronic setup, LED wall",
                    MinPrice = 55000,
                    MaxPrice = 120000,
                    AverageResponseTime = TimeSpan.FromHours(18),
                    Status = "Busy",
                    UpdatedAt = DateTime.UtcNow
                },
                new Performer
                {
                    Name = "Local Underground",
                    Email = "underground@local.rs",
                    Contact = "+381 64 111 2233",
                    Genre = "Hip-Hop",
                    Popularity = 45,
                    TechnicalRequirements = "Basic DJ setup, 2 mics",
                    MinPrice = 5000,
                    MaxPrice = 15000,
                    AverageResponseTime = TimeSpan.FromHours(6),
                    Status = "Available",
                    UpdatedAt = DateTime.UtcNow
                },
                new Performer
                {
                    Name = "Unassigned Rock Act",
                    Email = "booking@rockact.com",
                    Contact = "+44 20 5555 1234",
                    Genre = "Rock",
                    Popularity = 72,
                    TechnicalRequirements = "Standard rock backline",
                    MinPrice = 40000,
                    MaxPrice = 90000,
                    AverageResponseTime = TimeSpan.FromHours(20),
                    Status = "Available",
                    UpdatedAt = DateTime.UtcNow
                }
            };

            context.Performers.AddRange(performers);
            await context.SaveChangesAsync();
            Console.WriteLine($"✓ Created {performers.Count} performers");
            return performers;
        }

        private static async Task<List<Performance>> SeedPerformances(ApplicationDbContext context, List<Performer> performers, List<Venue> venues, List<Event> events)
        {
            var performances = new List<Performance>
            {
                // Event 1 (Winter Festival - Completed) - Belgrade Arena
                new Performance
                {
                    PerformerId = 1, // The Midnight Sons
                    VenueId = 1,
                    StartTime = events[0].StartDate.AddHours(20),
                    EndTime = events[0].StartDate.AddHours(22),
                    SetupTime = 120,
                    SoundcheckTime = 60,
                    Status = PerformanceStatus.Completed,
                    CreatedAt = DateTime.UtcNow.AddMonths(-3),
                    UpdatedAt = events[0].EndDate
                },
                
                // Event 2 (Electronic Weekend - In Progress)
                // Stark Arena
                new Performance
                {
                    PerformerId = 2, // DJ Stellar
                    VenueId = 2,
                    StartTime = events[1].StartDate.AddHours(21),
                    EndTime = events[1].StartDate.AddDays(1).AddHours(2),
                    SetupTime = 60,
                    SoundcheckTime = 30,
                    Status = PerformanceStatus.InProgress,
                    CreatedAt = DateTime.UtcNow.AddMonths(-2),
                    UpdatedAt = DateTime.UtcNow.AddDays(-1)
                },
                new Performance
                {
                    PerformerId = 4, // Electric Pulse
                    VenueId = 2,
                    StartTime = events[1].StartDate.AddDays(1).AddHours(22),
                    EndTime = events[1].StartDate.AddDays(2).AddHours(2),
                    SetupTime = 90,
                    SoundcheckTime = 45,
                    Status = PerformanceStatus.Planned,
                    CreatedAt = DateTime.UtcNow.AddMonths(-2),
                    UpdatedAt = DateTime.UtcNow.AddDays(-1)
                },
                // Drugstore Club
                new Performance
                {
                    PerformerId = 5, // Local Underground
                    VenueId = 3,
                    StartTime = events[1].StartDate.AddHours(23),
                    EndTime = events[1].StartDate.AddDays(1).AddHours(4),
                    SetupTime = 30,
                    SoundcheckTime = 20,
                    Status = PerformanceStatus.Completed,
                    CreatedAt = DateTime.UtcNow.AddMonths(-2),
                    UpdatedAt = DateTime.UtcNow
                },
                
                // Event 3 (Jazz Night - Future) - Sava Center
                new Performance
                {
                    PerformerId = 3, // Marija Jovanović Trio
                    VenueId = 4,
                    StartTime = events[2].StartDate.AddHours(20),
                    EndTime = events[2].StartDate.AddHours(22).AddMinutes(30),
                    SetupTime = 60,
                    SoundcheckTime = 45,
                    Status = PerformanceStatus.Planned,
                    CreatedAt = DateTime.UtcNow.AddDays(-30),
                    UpdatedAt = DateTime.UtcNow.AddDays(-5)
                },
                
                // Event 4 (Rock Festival - Future)
                // Main Stage - ASSIGNED (ima i PerformerId i VenueId)
                new Performance
                {
                    PerformerId = 1, // The Midnight Sons
                    VenueId = 5,
                    StartTime = events[3].StartDate.AddDays(1).AddHours(22),
                    EndTime = events[3].StartDate.AddDays(2).AddHours(0).AddMinutes(30),
                    SetupTime = 180,
                    SoundcheckTime = 90,
                    Status = PerformanceStatus.Planned,
                    CreatedAt = DateTime.UtcNow.AddDays(-45),
                    UpdatedAt = DateTime.UtcNow.AddDays(-10)
                },
                
                // UNASSIGNED performances - imaju PerformerId ali NEMAJU VenueId
                new Performance
                {
                    PerformerId = 6, // Unassigned Rock Act - ima performera
                    VenueId = null, // NEMA venue - UNASSIGNED
                    StartTime = events[3].StartDate.AddHours(18),
                    EndTime = events[3].StartDate.AddHours(20),
                    SetupTime = 90,
                    SoundcheckTime = 45,
                    Status = PerformanceStatus.Planned,
                    CreatedAt = DateTime.UtcNow.AddDays(-40),
                    UpdatedAt = DateTime.UtcNow.AddDays(-10)
                },
                new Performance
                {
                    PerformerId = 4, // Electric Pulse - ima performera
                    VenueId = null, // NEMA venue - UNASSIGNED
                    StartTime = events[3].StartDate.AddDays(1).AddHours(17),
                    EndTime = events[3].StartDate.AddDays(1).AddHours(19),
                    SetupTime = 90,
                    SoundcheckTime = 45,
                    Status = PerformanceStatus.Planned,
                    CreatedAt = DateTime.UtcNow.AddDays(-40),
                    UpdatedAt = DateTime.UtcNow.AddDays(-10)
                },
                new Performance
                {
                    PerformerId = 2, // DJ Stellar - ima performera
                    VenueId = null, // NEMA venue - UNASSIGNED
                    StartTime = events[3].StartDate.AddDays(2).AddHours(16),
                    EndTime = events[3].StartDate.AddDays(2).AddHours(18),
                    SetupTime = 60,
                    SoundcheckTime = 30,
                    Status = PerformanceStatus.Planned,
                    CreatedAt = DateTime.UtcNow.AddDays(-38),
                    UpdatedAt = DateTime.UtcNow.AddDays(-10)
                }
            };

            context.Performances.AddRange(performances);
            await context.SaveChangesAsync();

            var unassignedCount = performances.Count(p => p.PerformerId != null && p.VenueId == null);
            Console.WriteLine($"✓ Created {performances.Count} performances ({unassignedCount} unassigned - have Performer but no Venue)");
            return performances;
        }

        private static async Task<List<Ticket>> SeedTickets(ApplicationDbContext context, List<TicketType> ticketTypes, List<Zone> zones)
        {
            var tickets = new List<Ticket>();

            foreach (var ticketType in ticketTypes)
            {
                var zone = zones.First(z => z.ZoneId == ticketType.ZoneId);

                // Create varied number of tickets (30-80 per type)
                int ticketsToCreate = _random.Next(30, 80);

                for (int i = 0; i < ticketsToCreate; i++)
                {
                    var priceVariation = (decimal)(_random.NextDouble() * 0.2 - 0.1); // -10% to +10%
                    var finalPrice = zone.BasePrice + zone.BasePrice * priceVariation;

                    // Varied ticket statuses
                    TicketStatus status;
                    var statusRoll = _random.Next(100);
                    if (statusRoll < 40) status = TicketStatus.Available;
                    else if (statusRoll < 70) status = TicketStatus.Sold;
                    else if (statusRoll < 85) status = TicketStatus.Reserved;
                    else status = TicketStatus.Cancelled;

                    tickets.Add(new Ticket
                    {
                        UniqueCode = $"TKT-{ticketType.TicketTypeId:D3}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}",
                        QrCode = Guid.NewGuid().ToString(),
                        IssueDate = DateTime.UtcNow.AddDays(-_random.Next(1, 90)),
                        FinalPrice = Math.Round(finalPrice, 0),
                        Status = status,
                        TicketTypeId = ticketType.TicketTypeId
                    });
                }
            }

            context.Tickets.AddRange(tickets);
            await context.SaveChangesAsync();
            Console.WriteLine($"✓ Created {tickets.Count} tickets with varied statuses");
            return tickets;
        }

        private static async Task SeedRecordedSales(ApplicationDbContext context, List<Ticket> tickets, List<SpecialOffer> specialOffers, List<ApplicationUser> users)
        {
            var recordedSales = new List<RecordedSale>();
            var paymentMethods = new[] { PaymentMethod.CreditCard, PaymentMethod.DebitCard, PaymentMethod.PayPal, PaymentMethod.BankTransfer };

            var soldOrReservedTickets = tickets.Where(t => t.Status == TicketStatus.Sold || t.Status == TicketStatus.Reserved).ToList();
            var availableTickets = new List<Ticket>(soldOrReservedTickets);

            // Distribution of sales across different time periods
            var salesDistribution = new[]
            {
                // (daysAgo, salesCount, description)
                (0, 8, "Today"), // TODAY - for daily revenue
                (-1, 12, "Yesterday"),
                (-2, 10, "2 days ago"),
                (-3, 6, "3 days ago"),
                (-4, 5, "4 days ago"),
                (-5, 8, "5 days ago"),
                (-6, 7, "6 days ago"), // One week ago - for weekly revenue
                (-10, 5, "10 days ago"),
                (-15, 6, "15 days ago"),
                (-20, 4, "20 days ago"),
                (-30, 5, "30 days ago"),
                (-45, 3, "45 days ago"),
                (-60, 2, "60 days ago")
            };

            foreach (var (daysAgo, salesCount, description) in salesDistribution)
            {
                for (int i = 0; i < salesCount && availableTickets.Count > 0; i++)
                {
                    var user = users[_random.Next(users.Count)];
                    var saleDate = DateTime.UtcNow.AddDays(daysAgo).AddHours(_random.Next(-12, 12));

                    // Select 1-4 tickets for this sale
                    var ticketCount = Math.Min(_random.Next(1, 5), availableTickets.Count);
                    var saleTickets = new List<Ticket>();

                    for (int j = 0; j < ticketCount; j++)
                    {
                        var ticket = availableTickets[_random.Next(availableTickets.Count)];
                        saleTickets.Add(ticket);
                        availableTickets.Remove(ticket);
                    }

                    if (saleTickets.Count == 0) continue;

                    var totalAmount = saleTickets.Sum(t => t.FinalPrice);
                    var appliedOffers = new List<SpecialOffer>();

                    // Randomly apply 0-1 special offers
                    if (_random.Next(100) < 40) // 40% chance
                    {
                        var offer = specialOffers[_random.Next(specialOffers.Count)];
                        appliedOffers.Add(offer);
                        totalAmount -= totalAmount * (offer.DiscountValue / 100m);
                    }

                    // Transaction status distribution
                    TransactionStatus status;
                    var statusRoll = _random.Next(100);
                    if (statusRoll < 85) status = TransactionStatus.Completed;
                    else if (statusRoll < 95) status = TransactionStatus.Pending;
                    else status = TransactionStatus.Failed;

                    var sale = new RecordedSale
                    {
                        TotalAmount = Math.Round(Math.Max(totalAmount, 0), 2),
                        SaleDate = saleDate,
                        TransactionStatus = status,
                        PaymentMethod = paymentMethods[_random.Next(paymentMethods.Length)],
                        ApplicationUserId = user.Id,
                        Tickets = saleTickets,
                        SpecialOffers = appliedOffers
                    };

                    recordedSales.Add(sale);

                    // Update ticket statuses
                    foreach (var ticket in saleTickets)
                    {
                        ticket.Status = status == TransactionStatus.Completed ? TicketStatus.Sold :
                                       status == TransactionStatus.Failed ? TicketStatus.Available :
                                       TicketStatus.Reserved;
                    }
                }
            }

            context.RecordedSales.AddRange(recordedSales);
            await context.SaveChangesAsync();

            // Link tickets to their sales
            foreach (var sale in recordedSales)
            {
                foreach (var ticket in sale.Tickets)
                {
                    ticket.RecordedSaleId = sale.RecordedSaleId;
                }
            }
            await context.SaveChangesAsync();

            var todaySales = recordedSales.Count(s => s.SaleDate.Date == DateTime.UtcNow.Date);
            var thisWeekSales = recordedSales.Count(s => s.SaleDate >= DateTime.UtcNow.AddDays(-7));
            var todayRevenue = recordedSales.Where(s => s.SaleDate.Date == DateTime.UtcNow.Date && s.TransactionStatus == TransactionStatus.Completed).Sum(s => s.TotalAmount);

            Console.WriteLine($"✓ Created {recordedSales.Count} recorded sales");
            Console.WriteLine($"  ├─ Today: {todaySales} sales (Revenue: {todayRevenue:N0} RSD)");
            Console.WriteLine($"  ├─ This week: {thisWeekSales} sales");
            Console.WriteLine($"  └─ Distributed across {salesDistribution.Length} time periods");
        }

        private static async Task LinkRelationships(ApplicationDbContext context, List<Event> events, List<TicketType> ticketTypes, List<PricingRule> pricingRules, List<SpecialOffer> specialOffers)
        {
            // Link pricing rules to events (1-2 rules per event)
            foreach (var evt in events)
            {
                var rulesToAdd = _random.Next(1, 3);
                var selectedRules = pricingRules.OrderBy(x => _random.Next()).Take(rulesToAdd).ToList();
                foreach (var rule in selectedRules)
                {
                    evt.PricingRules.Add(rule);
                }
            }

            // Link pricing rules to ticket types (1 rule per ticket type)
            foreach (var ticketType in ticketTypes)
            {
                var rule = pricingRules[_random.Next(pricingRules.Count)];
                ticketType.PricingRules.Add(rule);
            }

            // Link special offers to ticket types (some offers for specific types)
            foreach (var offer in specialOffers)
            {
                var ticketTypeCount = _random.Next(2, 6);
                var selectedTypes = ticketTypes.OrderBy(x => _random.Next()).Take(ticketTypeCount).ToList();
                foreach (var tt in selectedTypes)
                {
                    offer.TicketTypes.Add(tt);
                }
            }

            await context.SaveChangesAsync();
            Console.WriteLine("✓ Linked many-to-many relationships");
        }
    }
}