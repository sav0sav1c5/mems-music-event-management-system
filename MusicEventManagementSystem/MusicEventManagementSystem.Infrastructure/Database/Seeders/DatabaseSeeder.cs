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
        public static async Task SeedAsync(ApplicationDbContext context)
        {
            // Check if data already exists
            if (context.Events.Any())
            {
                return; // Already seeded
            }

            var random = new Random(42); // Fixed seed for reproducibility

            // 1. Seed ApplicationUsers
            var applicationUsers = new List<ApplicationUser>
            {
                new ApplicationUser
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = "savo@ticketsales.com",
                    Email = "savo@ticketsales.com",
                    NormalizedUserName = "SAVO@TICKETSALES.COM",
                    NormalizedEmail = "SAVO@TICKETSALES.COM",
                    FirstName = "Savo",
                    LastName = "Savić",
                    PhoneNumber = "+381641234568",
                    Department = Department.TicketSales,
                    EmailConfirmed = true,
                    CreatedAt = DateTime.UtcNow.AddMonths(-6),
                    IsActive = true
                },
                new ApplicationUser
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = "tijana@eventorganization.com",
                    Email = "tijana@eventorganization.com",
                    NormalizedUserName = "TIJANA@EVENTORGANIZATION.COM",
                    NormalizedEmail = "TIJANA@EVENTORGANIZATION.COM",
                    FirstName = "Tijana",
                    LastName = "Lazić",
                    PhoneNumber = "+381641234569",
                    Department = Department.EventOrganization,
                    EmailConfirmed = true,
                    CreatedAt = DateTime.UtcNow.AddMonths(-8),
                    IsActive = true
                },
                new ApplicationUser
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = "marina@mediacampaign.com",
                    Email = "marina@mediacampaign.com",
                    NormalizedUserName = "MARINA@MEDIACAMPAIGN.COM",
                    NormalizedEmail = "MARINA@MEDIACAMPAIGN.COM",
                    FirstName = "Marina",
                    LastName = "Khan",
                    PhoneNumber = "+381641234570",
                    Department = Department.MediaCampaign,
                    EmailConfirmed = true,
                    CreatedAt = DateTime.UtcNow.AddMonths(-4),
                    IsActive = true
                },
                new ApplicationUser
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = "milos@artistcommunication.com",
                    Email = "milos@artistcommunication.com",
                    NormalizedUserName = "MILOS@ARTISTCOMMUNICATION.COM",
                    NormalizedEmail = "MILOS@ARTISTCOMMUNICATION.COM",
                    FirstName = "Milos",
                    LastName = "Trivković",
                    PhoneNumber = "+381641234571",
                    Department = Department.ArtistCommunication,
                    EmailConfirmed = true,
                    CreatedAt = DateTime.UtcNow.AddMonths(-10),
                    IsActive = true
                },
                new ApplicationUser
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = "stefan@mediacampaign.com",
                    Email = "stefan@mediacampaign.com",
                    NormalizedUserName = "STEFAN@MEDIACAMPAIGN.COM",
                    NormalizedEmail = "STEFAN@MEDIACAMPAIGN.COM",
                    FirstName = "Stefan",
                    LastName = "Pavlović",
                    PhoneNumber = "+381641234572",
                    Department = Department.MediaCampaign,
                    EmailConfirmed = true,
                    CreatedAt = DateTime.UtcNow.AddMonths(-3),
                    IsActive = true
                }
            };
            context.Users.AddRange(applicationUsers);
            await context.SaveChangesAsync();

            // 2. Seed Locations
            var locations = new List<Location>
            {
                new Location { Name = "Belgrade" },
                new Location { Name = "Novi Sad" },
                new Location { Name = "Niš" },
                new Location { Name = "Kragujevac" },
                new Location { Name = "Subotica" }
            };
            context.Locations.AddRange(locations);
            await context.SaveChangesAsync();

            // 3. Seed Events
            var events = new List<Event>
            {
                new Event
                {
                    Name = "Rock Legends Live 2025",
                    Description = "International rock festival featuring legendary bands and emerging artists from around the world",
                    StartDate = DateTime.UtcNow.AddMonths(2),
                    EndDate = DateTime.UtcNow.AddMonths(2).AddDays(2),
                    Status = EventStatus.Planned,
                    CreatedById = Guid.Parse(applicationUsers[1].Id),
                    LocationId = 1,
                    CreatedAt = DateTime.UtcNow.AddMonths(-2),
                    UpdatedAt = DateTime.UtcNow.AddDays(-5)
                },
                new Event
                {
                    Name = "Indie Discovery Night",
                    Description = "Showcase of the best indie and alternative artists from the Balkans region",
                    StartDate = DateTime.UtcNow.AddMonths(1),
                    EndDate = DateTime.UtcNow.AddMonths(1).AddHours(8),
                    Status = EventStatus.InProgress,
                    CreatedById = Guid.Parse(applicationUsers[1].Id),
                    LocationId = 1,
                    CreatedAt = DateTime.UtcNow.AddMonths(-1),
                    UpdatedAt = DateTime.UtcNow.AddDays(-2)
                },
                new Event
                {
                    Name = "Electronic Waves Festival",
                    Description = "Premier electronic music festival with top international DJs and producers",
                    StartDate = DateTime.UtcNow.AddMonths(3),
                    EndDate = DateTime.UtcNow.AddMonths(3).AddDays(3),
                    Status = EventStatus.Planned,
                    CreatedById = Guid.Parse(applicationUsers[1].Id),
                    LocationId = 1,
                    CreatedAt = DateTime.UtcNow.AddMonths(-1),
                    UpdatedAt = DateTime.UtcNow.AddDays(-10)
                },
                new Event
                {
                    Name = "Exit Festival 2025",
                    Description = "Award-winning music festival in Petrovaradin Fortress with multiple stages",
                    StartDate = DateTime.UtcNow.AddMonths(4),
                    EndDate = DateTime.UtcNow.AddMonths(4).AddDays(4),
                    Status = EventStatus.Planned,
                    CreatedById = Guid.Parse(applicationUsers[1].Id),
                    LocationId = 2,
                    CreatedAt = DateTime.UtcNow.AddMonths(-3),
                    UpdatedAt = DateTime.UtcNow.AddDays(-7)
                },
                new Event
                {
                    Name = "Jazz & Blues Evening",
                    Description = "Elegant evening of jazz and blues with renowned international musicians",
                    StartDate = DateTime.UtcNow.AddDays(45),
                    EndDate = DateTime.UtcNow.AddDays(45).AddHours(5),
                    Status = EventStatus.Planned,
                    CreatedById = Guid.Parse(applicationUsers[1].Id),
                    LocationId = 1,
                    CreatedAt = DateTime.UtcNow.AddDays(-30),
                    UpdatedAt = DateTime.UtcNow.AddDays(-3)
                },
                new Event
                {
                    Name = "Nisville Jazz Festival",
                    Description = "Traditional jazz festival in the historic Niš Fortress with international lineup",
                    StartDate = DateTime.UtcNow.AddMonths(5),
                    EndDate = DateTime.UtcNow.AddMonths(5).AddDays(3),
                    Status = EventStatus.Planned,
                    CreatedById = Guid.Parse(applicationUsers[1].Id),
                    LocationId = 3,
                    CreatedAt = DateTime.UtcNow.AddMonths(-2),
                    UpdatedAt = DateTime.UtcNow.AddDays(-15)
                },
                new Event
                {
                    Name = "Underground Electronic Night",
                    Description = "Underground electronic music night with local and international DJs",
                    StartDate = DateTime.UtcNow.AddDays(20),
                    EndDate = DateTime.UtcNow.AddDays(20).AddHours(10),
                    Status = EventStatus.InProgress,
                    CreatedById = Guid.Parse(applicationUsers[1].Id),
                    LocationId = 1,
                    CreatedAt = DateTime.UtcNow.AddDays(-40),
                    UpdatedAt = DateTime.UtcNow.AddDays(-1)
                },
                new Event
                {
                    Name = "Summer Stadium Concert",
                    Description = "Major outdoor concert with multiple international headliners and supporting acts",
                    StartDate = DateTime.UtcNow.AddMonths(6),
                    EndDate = DateTime.UtcNow.AddMonths(6).AddHours(12),
                    Status = EventStatus.Planned,
                    CreatedById = Guid.Parse(applicationUsers[1].Id),
                    LocationId = 1,
                    CreatedAt = DateTime.UtcNow.AddMonths(-1),
                    UpdatedAt = DateTime.UtcNow.AddDays(-8)
                }
            };
            context.Events.AddRange(events);
            await context.SaveChangesAsync();

            // 4. Seed Venues (now linked to Events)
            var venues = new List<Venue>
            {
                // Rock Legends Live - Belgrade Arena
                new Venue
                {
                    Name = "Belgrade Arena - Main Stage",
                    Description = "Serbia's largest indoor arena for major concerts and events",
                    City = "Belgrade",
                    Address = "Bulevar Arsenija Čarnojevića 58",
                    Capacity = 20000,
                    VenueType = VenueType.Arena,
                    EventId = 1
                },
                // Indie Discovery Night - Youth Center
                new Venue
                {
                    Name = "Youth Center Belgrade",
                    Description = "Cultural center for intimate performances and indie shows",
                    City = "Belgrade",
                    Address = "Makedonska 22-24",
                    Capacity = 1500,
                    VenueType = VenueType.Club,
                    EventId = 2
                },
                // Electronic Waves - Stark Arena
                new Venue
                {
                    Name = "Stark Arena",
                    Description = "Modern multifunctional arena for sports and entertainment",
                    City = "Belgrade",
                    Address = "Bulevar Milutina Milankovića",
                    Capacity = 18400,
                    VenueType = VenueType.Arena,
                    EventId = 3
                },
                // Exit Festival - Main Stage
                new Venue
                {
                    Name = "Exit Festival Main Stage",
                    Description = "Main stage of the famous Exit Festival",
                    City = "Novi Sad",
                    Address = "Petrovaradin Fortress",
                    Capacity = 40000,
                    VenueType = VenueType.Stadium,
                    EventId = 4
                },
                // Exit Festival - Dance Arena
                new Venue
                {
                    Name = "Exit Festival Dance Arena",
                    Description = "Electronic music stage with stunning fortress views",
                    City = "Novi Sad",
                    Address = "Petrovaradin Fortress - Dance Arena",
                    Capacity = 15000,
                    VenueType = VenueType.Outdoor,
                    EventId = 4
                },
                // Jazz & Blues - Sava Center
                new Venue
                {
                    Name = "Sava Center",
                    Description = "Premier convention and concert venue in Belgrade",
                    City = "Belgrade",
                    Address = "Milentija Popovića 9",
                    Capacity = 4000,
                    VenueType = VenueType.Theater,
                    EventId = 5
                },
                // Nisville - Jazz Stage
                new Venue
                {
                    Name = "Nisville Jazz Stage",
                    Description = "Outdoor stage for jazz and world music festival",
                    City = "Niš",
                    Address = "Niš Fortress",
                    Capacity = 8000,
                    VenueType = VenueType.Outdoor,
                    EventId = 6
                },
                // Underground Electronic - Drugstore
                new Venue
                {
                    Name = "Drugstore Club",
                    Description = "Underground club for electronic music events",
                    City = "Belgrade",
                    Address = "Svetogorska 6",
                    Capacity = 800,
                    VenueType = VenueType.Club,
                    EventId = 7
                },
                // Summer Stadium - Tašmajdan
                new Venue
                {
                    Name = "Tašmajdan Stadium",
                    Description = "Historic stadium for large outdoor concerts",
                    City = "Belgrade",
                    Address = "Takovska 6",
                    Capacity = 35000,
                    VenueType = VenueType.Stadium,
                    EventId = 8
                }
            };
            context.Venues.AddRange(venues);
            await context.SaveChangesAsync();

            // 5. Seed Segments
            var segments = new List<Segment>
            {
                // Belgrade Arena segments (Venue 1)
                new Segment { Name = "Floor Standing", Description = "Main floor standing area", Capacity = 8000, SegmentType = SegmentType.Standing, VenueId = 1 },
                new Segment { Name = "West Tribune", Description = "Western seated section", Capacity = 4000, SegmentType = SegmentType.Seated, VenueId = 1 },
                new Segment { Name = "East Tribune", Description = "Eastern seated section", Capacity = 4000, SegmentType = SegmentType.Seated, VenueId = 1 },
                new Segment { Name = "North Tribune", Description = "Northern seated section", Capacity = 2000, SegmentType = SegmentType.Seated, VenueId = 1 },
                new Segment { Name = "South Tribune", Description = "Southern seated section", Capacity = 2000, SegmentType = SegmentType.Seated, VenueId = 1 },
                
                // Youth Center segments (Venue 2)
                new Segment { Name = "Main Hall", Description = "Main hall of Youth Center", Capacity = 1500, SegmentType = SegmentType.Standing, VenueId = 2 },
                
                // Stark Arena segments (Venue 3)
                new Segment { Name = "Floor Area", Description = "Main floor area", Capacity = 7000, SegmentType = SegmentType.Standing, VenueId = 3 },
                new Segment { Name = "Lower Bowl", Description = "Lower bowl seating", Capacity = 6000, SegmentType = SegmentType.Seated, VenueId = 3 },
                new Segment { Name = "Upper Bowl", Description = "Upper bowl seating", Capacity = 5400, SegmentType = SegmentType.Seated, VenueId = 3 },
                
                // Exit Main Stage segments (Venue 4)
                new Segment { Name = "Main Stage Area", Description = "Main stage festival grounds", Capacity = 40000, SegmentType = SegmentType.Standing, VenueId = 4 },
                
                // Exit Dance Arena segments (Venue 5)
                new Segment { Name = "Dance Arena Floor", Description = "Dance arena main floor", Capacity = 15000, SegmentType = SegmentType.Standing, VenueId = 5 },
                
                // Sava Center segments (Venue 6)
                new Segment { Name = "Orchestra", Description = "Orchestra level seating", Capacity = 2000, SegmentType = SegmentType.Seated, VenueId = 6 },
                new Segment { Name = "Balcony", Description = "Balcony level seating", Capacity = 2000, SegmentType = SegmentType.Seated, VenueId = 6 },
                
                // Nisville segments (Venue 7)
                new Segment { Name = "Festival Ground", Description = "Open air festival area", Capacity = 8000, SegmentType = SegmentType.Standing, VenueId = 7 },
                
                // Drugstore segments (Venue 8)
                new Segment { Name = "Club Floor", Description = "Main club dance floor", Capacity = 800, SegmentType = SegmentType.Standing, VenueId = 8 },
                
                // Tašmajdan segments (Venue 9)
                new Segment { Name = "Stadium Field", Description = "Main stadium field", Capacity = 25000, SegmentType = SegmentType.Standing, VenueId = 9 },
                new Segment { Name = "Stadium Seats", Description = "Stadium seating areas", Capacity = 10000, SegmentType = SegmentType.Seated, VenueId = 9 }
            };
            context.Segments.AddRange(segments);
            await context.SaveChangesAsync();

            // 6. Seed Zones
            var zones = new List<Zone>
            {
                // Belgrade Arena zones (Segments 1-5)
                new Zone { Name = "Floor Front", Description = "Front section of the floor", Capacity = 3000, BasePrice = 8000, Position = ZonePosition.Front, SegmentId = 1 },
                new Zone { Name = "Floor Back", Description = "Back section of the floor", Capacity = 5000, BasePrice = 6500, Position = ZonePosition.Back, SegmentId = 1 },
                new Zone { Name = "West Lower", Description = "Lower west tribune", Capacity = 2000, BasePrice = 5500, Position = ZonePosition.Lower, SegmentId = 2 },
                new Zone { Name = "West Upper", Description = "Upper west tribune", Capacity = 2000, BasePrice = 4500, Position = ZonePosition.Upper, SegmentId = 2 },
                new Zone { Name = "East Lower", Description = "Lower east tribune", Capacity = 2000, BasePrice = 5500, Position = ZonePosition.Lower, SegmentId = 3 },
                new Zone { Name = "East Upper", Description = "Upper east tribune", Capacity = 2000, BasePrice = 4500, Position = ZonePosition.Upper, SegmentId = 3 },
                new Zone { Name = "North Section", Description = "North tribune seating", Capacity = 2000, BasePrice = 4000, Position = ZonePosition.Left, SegmentId = 4 },
                new Zone { Name = "South Section", Description = "South tribune seating", Capacity = 2000, BasePrice = 4000, Position = ZonePosition.Right, SegmentId = 5 },
                
                // Youth Center zones (Segment 6)
                new Zone { Name = "Front Area", Description = "Close to stage area", Capacity = 500, BasePrice = 3500, Position = ZonePosition.Front, SegmentId = 6 },
                new Zone { Name = "Middle Area", Description = "Middle section of the hall", Capacity = 700, BasePrice = 3000, Position = ZonePosition.Center, SegmentId = 6 },
                new Zone { Name = "Back Area", Description = "Rear section of the hall", Capacity = 300, BasePrice = 2500, Position = ZonePosition.Back, SegmentId = 6 },
                
                // Stark Arena zones (Segments 7-9)
                new Zone { Name = "Golden Circle", Description = "VIP standing area", Capacity = 1000, BasePrice = 12000, Position = ZonePosition.Front, SegmentId = 7 },
                new Zone { Name = "General Floor", Description = "General admission floor", Capacity = 6000, BasePrice = 7000, Position = ZonePosition.Center, SegmentId = 7 },
                new Zone { Name = "Lower Bowl Seats", Description = "Premium lower seating", Capacity = 6000, BasePrice = 6000, Position = ZonePosition.Lower, SegmentId = 8 },
                new Zone { Name = "Upper Bowl Seats", Description = "Upper level seating", Capacity = 5400, BasePrice = 4500, Position = ZonePosition.Upper, SegmentId = 9 },
                
                // Exit Main Stage zones (Segment 10)
                new Zone { Name = "Main Stage Front", Description = "Close to main stage", Capacity = 10000, BasePrice = 15000, Position = ZonePosition.Front, SegmentId = 10 },
                new Zone { Name = "Main Stage Center", Description = "Central festival area", Capacity = 25000, BasePrice = 12000, Position = ZonePosition.Center, SegmentId = 10 },
                new Zone { Name = "Main Stage Back", Description = "Back festival area", Capacity = 5000, BasePrice = 10000, Position = ZonePosition.Back, SegmentId = 10 },
                
                // Exit Dance Arena zones (Segment 11)
                new Zone { Name = "Dance Arena VIP", Description = "VIP area close to DJ booth", Capacity = 2000, BasePrice = 13000, Position = ZonePosition.Front, SegmentId = 11 },
                new Zone { Name = "Dance Arena General", Description = "General dance floor", Capacity = 13000, BasePrice = 11000, Position = ZonePosition.Center, SegmentId = 11 },
                
                // Sava Center zones (Segments 12-13)
                new Zone { Name = "Orchestra Premium", Description = "Premium orchestra seats", Capacity = 1000, BasePrice = 5000, Position = ZonePosition.Front, SegmentId = 12 },
                new Zone { Name = "Orchestra Standard", Description = "Standard orchestra seats", Capacity = 1000, BasePrice = 4000, Position = ZonePosition.Back, SegmentId = 12 },
                new Zone { Name = "Balcony Level", Description = "Balcony seating", Capacity = 2000, BasePrice = 3500, Position = ZonePosition.Balcony, SegmentId = 13 },
                
                // Nisville zones (Segment 14)
                new Zone { Name = "Jazz Front", Description = "Front of jazz stage", Capacity = 2000, BasePrice = 4500, Position = ZonePosition.Front, SegmentId = 14 },
                new Zone { Name = "Jazz General", Description = "General admission area", Capacity = 6000, BasePrice = 3500, Position = ZonePosition.Center, SegmentId = 14 },
                
                // Drugstore zones (Segment 15)
                new Zone { Name = "DJ Booth Area", Description = "Close to DJ booth", Capacity = 300, BasePrice = 2500, Position = ZonePosition.Front, SegmentId = 15 },
                new Zone { Name = "Dance Floor", Description = "Main dance area", Capacity = 500, BasePrice = 2000, Position = ZonePosition.Center, SegmentId = 15 },
                
                // Tašmajdan zones (Segments 16-17)
                new Zone { Name = "Stadium Floor", Description = "Main stadium floor", Capacity = 25000, BasePrice = 6000, Position = ZonePosition.Center, SegmentId = 16 },
                new Zone { Name = "Stadium Seats", Description = "Stadium seating", Capacity = 10000, BasePrice = 4500, Position = ZonePosition.Upper, SegmentId = 17 }
            };
            context.Zones.AddRange(zones);
            await context.SaveChangesAsync();

            // 7. Seed PricingRules
            var pricingRules = new List<PricingRule>
            {
                new PricingRule
                {
                    Name = "Standard Dynamic Pricing",
                    Description = "Standard pricing model with early bird discounts",
                    MinimumPrice = 1500,
                    MaximumPrice = 12000,
                    OccupancyPercentage1 = 50,
                    OccupancyPercentage2 = 80,
                    OccupancyThreshold1 = 1.2m,
                    OccupancyThreshold2 = 1.5m,
                    EarlyBirdPercentage = 20,
                    PricingCondition = PricingCondition.TimeBasedEarlyBird,
                    DynamicCondition = "Time-based pricing with demand adjustments",
                    Modifier = 1.0m
                },
                new PricingRule
                {
                    Name = "High Demand Pricing",
                    Description = "Dynamic pricing based on venue occupancy levels",
                    MinimumPrice = 2500,
                    MaximumPrice = 18000,
                    OccupancyPercentage1 = 60,
                    OccupancyPercentage2 = 90,
                    OccupancyThreshold1 = 1.3m,
                    OccupancyThreshold2 = 2.0m,
                    EarlyBirdPercentage = 25,
                    PricingCondition = PricingCondition.OccupancyBased,
                    DynamicCondition = "Price increases with venue capacity utilization",
                    Modifier = 1.2m
                },
                new PricingRule
                {
                    Name = "Premium VIP Pricing",
                    Description = "Luxury pricing for VIP zones and premium experiences",
                    MinimumPrice = 8000,
                    MaximumPrice = 35000,
                    OccupancyPercentage1 = 40,
                    OccupancyPercentage2 = 70,
                    OccupancyThreshold1 = 1.5m,
                    OccupancyThreshold2 = 2.5m,
                    EarlyBirdPercentage = 15,
                    PricingCondition = PricingCondition.VIPUpgrade,
                    DynamicCondition = "Premium pricing for exclusive access areas",
                    Modifier = 2.0m
                },
                new PricingRule
                {
                    Name = "Weekend Premium",
                    Description = "Higher pricing for weekend events",
                    MinimumPrice = 2000,
                    MaximumPrice = 15000,
                    OccupancyPercentage1 = 55,
                    OccupancyPercentage2 = 85,
                    OccupancyThreshold1 = 1.4m,
                    OccupancyThreshold2 = 1.8m,
                    EarlyBirdPercentage = 18,
                    PricingCondition = PricingCondition.DayOfWeek,
                    DynamicCondition = "Weekend events carry premium pricing",
                    Modifier = 1.3m
                },
                new PricingRule
                {
                    Name = "Last Minute Pricing",
                    Description = "Special pricing for tickets sold close to event date",
                    MinimumPrice = 1000,
                    MaximumPrice = 8000,
                    OccupancyPercentage1 = 30,
                    OccupancyPercentage2 = 60,
                    OccupancyThreshold1 = 0.8m,
                    OccupancyThreshold2 = 1.1m,
                    EarlyBirdPercentage = 0,
                    PricingCondition = PricingCondition.LastMinute,
                    DynamicCondition = "Reduced pricing for last-minute sales",
                    Modifier = 0.8m
                },
                new PricingRule
                {
                    Name = "Festival Season Pricing",
                    Description = "Seasonal pricing adjustments for festival period",
                    MinimumPrice = 3000,
                    MaximumPrice = 20000,
                    OccupancyPercentage1 = 65,
                    OccupancyPercentage2 = 95,
                    OccupancyThreshold1 = 1.6m,
                    OccupancyThreshold2 = 2.2m,
                    EarlyBirdPercentage = 30,
                    PricingCondition = PricingCondition.SeasonalDiscount,
                    DynamicCondition = "Festival season pricing with volume discounts",
                    Modifier = 1.4m
                }
            };
            context.PricingRules.AddRange(pricingRules);
            await context.SaveChangesAsync();

            // 8. Seed SpecialOffers
            var specialOffers = new List<SpecialOffer>
            {
                new SpecialOffer
                {
                    Name = "Early Bird Special",
                    Description = "Early bird discount for advance purchases",
                    StartDate = DateTime.UtcNow,
                    EndDate = DateTime.UtcNow.AddMonths(1),
                    ApplicationCondition = "Purchase within first month of ticket release",
                    DiscountValue = 20,
                    TicketLimit = 1000,
                    OfferType = OfferType.EarlyBird
                },
                new SpecialOffer
                {
                    Name = "Student Discount",
                    Description = "Special pricing for students with valid ID",
                    StartDate = DateTime.UtcNow,
                    EndDate = DateTime.UtcNow.AddMonths(3),
                    ApplicationCondition = "Valid student ID required",
                    DiscountValue = 15,
                    TicketLimit = 500,
                    OfferType = OfferType.StudentDiscount
                },
                new SpecialOffer
                {
                    Name = "Group Booking Deal",
                    Description = "Discount for group purchases of 5 or more tickets",
                    StartDate = DateTime.UtcNow,
                    EndDate = DateTime.UtcNow.AddMonths(2),
                    ApplicationCondition = "Purchase 5+ tickets in single transaction",
                    DiscountValue = 25,
                    TicketLimit = 200,
                    OfferType = OfferType.GroupDiscount
                },
                new SpecialOffer
                {
                    Name = "Last Minute Deal",
                    Description = "Special discount for last-minute purchases",
                    StartDate = DateTime.UtcNow.AddMonths(1).AddDays(20),
                    EndDate = DateTime.UtcNow.AddMonths(2),
                    ApplicationCondition = "Purchase within 7 days of event",
                    DiscountValue = 10,
                    TicketLimit = 300,
                    OfferType = OfferType.PercentageOff
                },
                new SpecialOffer
                {
                    Name = "Senior Citizen Discount",
                    Description = "Special pricing for visitors over 65",
                    StartDate = DateTime.UtcNow,
                    EndDate = DateTime.UtcNow.AddMonths(4),
                    ApplicationCondition = "Valid ID showing age 65+",
                    DiscountValue = 30,
                    TicketLimit = 150,
                    OfferType = OfferType.SeniorDiscount
                },
                new SpecialOffer
                {
                    Name = "Buy One Get One 50%",
                    Description = "Second ticket at 50% discount",
                    StartDate = DateTime.UtcNow.AddDays(10),
                    EndDate = DateTime.UtcNow.AddMonths(1).AddDays(10),
                    ApplicationCondition = "Valid for specific events only",
                    DiscountValue = 50,
                    TicketLimit = 400,
                    OfferType = OfferType.BuyOneGetOne
                },
                new SpecialOffer
                {
                    Name = "VIP Season Pass",
                    Description = "Access to all events with VIP treatment",
                    StartDate = DateTime.UtcNow,
                    EndDate = DateTime.UtcNow.AddYears(1),
                    ApplicationCondition = "Limited availability - premium access",
                    DiscountValue = 0,
                    TicketLimit = 50,
                    OfferType = OfferType.SeasonPass
                },
                new SpecialOffer
                {
                    Name = "Loyalty Member Discount",
                    Description = "Exclusive discount for returning customers",
                    StartDate = DateTime.UtcNow,
                    EndDate = DateTime.UtcNow.AddMonths(6),
                    ApplicationCondition = "Previous purchase history required",
                    DiscountValue = 12,
                    TicketLimit = 800,
                    OfferType = OfferType.LoyaltyDiscount
                }
            };
            context.SpecialOffers.AddRange(specialOffers);
            await context.SaveChangesAsync();

            // 9. Seed TicketTypes
            var ticketTypes = new List<TicketType>
            {
                // Event 1: Rock Legends Live (Belgrade Arena - Venue 1) - Zones 1-8
                new TicketType { Name = "Floor Front - Rock Legends", Description = "Premium floor access close to stage", AvailableQuantity = 2800, Status = TicketTypeStatus.Active, ZoneId = 1, EventId = 1 },
                new TicketType { Name = "Floor General - Rock Legends", Description = "General floor admission", AvailableQuantity = 4800, Status = TicketTypeStatus.Active, ZoneId = 2, EventId = 1 },
                new TicketType { Name = "West Lower - Rock Legends", Description = "Lower west tribune seating", AvailableQuantity = 1900, Status = TicketTypeStatus.Active, ZoneId = 3, EventId = 1 },
                new TicketType { Name = "West Upper - Rock Legends", Description = "Upper west tribune seating", AvailableQuantity = 1900, Status = TicketTypeStatus.Active, ZoneId = 4, EventId = 1 },
                new TicketType { Name = "East Lower - Rock Legends", Description = "Lower east tribune seating", AvailableQuantity = 1900, Status = TicketTypeStatus.Active, ZoneId = 5, EventId = 1 },
                
                // Event 2: Indie Discovery Night (Youth Center - Venue 2) - Zones 9-11
                new TicketType { Name = "Front Row - Indie Night", Description = "Close to stage experience", AvailableQuantity = 480, Status = TicketTypeStatus.Active, ZoneId = 9, EventId = 2 },
                new TicketType { Name = "General Admission - Indie", Description = "Standard admission ticket", AvailableQuantity = 680, Status = TicketTypeStatus.Active, ZoneId = 10, EventId = 2 },
                new TicketType { Name = "Back Area - Indie", Description = "Casual viewing area", AvailableQuantity = 280, Status = TicketTypeStatus.Active, ZoneId = 11, EventId = 2 },
                
                // Event 3: Electronic Waves (Stark Arena - Venue 3) - Zones 12-15
                new TicketType { Name = "Golden Circle - Electronic", Description = "VIP access to main stage area", AvailableQuantity = 950, Status = TicketTypeStatus.Active, ZoneId = 12, EventId = 3 },
                new TicketType { Name = "General Floor - Electronic", Description = "Main dance floor access", AvailableQuantity = 5800, Status = TicketTypeStatus.Active, ZoneId = 13, EventId = 3 },
                new TicketType { Name = "Lower Bowl - Electronic", Description = "Seated viewing with great stage view", AvailableQuantity = 5700, Status = TicketTypeStatus.Active, ZoneId = 14, EventId = 3 },
                new TicketType { Name = "Upper Bowl - Electronic", Description = "Upper level seats", AvailableQuantity = 5200, Status = TicketTypeStatus.Active, ZoneId = 15, EventId = 3 },
                
                // Event 4: Exit Festival - Main Stage (Venue 4) - Zones 16-18
                new TicketType { Name = "Exit - Main Stage Front", Description = "Premium access to main stage front", AvailableQuantity = 9500, Status = TicketTypeStatus.Active, ZoneId = 16, EventId = 4 },
                new TicketType { Name = "Exit - General Festival", Description = "Full festival grounds access", AvailableQuantity = 24000, Status = TicketTypeStatus.Active, ZoneId = 17, EventId = 4 },
                new TicketType { Name = "Exit - Chill Zone", Description = "Relaxed area with full festival access", AvailableQuantity = 4800, Status = TicketTypeStatus.Active, ZoneId = 18, EventId = 4 },
                
                // Event 4: Exit Festival - Dance Arena (Venue 5) - Zones 19-20
                new TicketType { Name = "Exit - Dance Arena VIP", Description = "VIP Dance Arena access", AvailableQuantity = 1900, Status = TicketTypeStatus.Active, ZoneId = 19, EventId = 4 },
                new TicketType { Name = "Exit - Dance Arena General", Description = "General Dance Arena ticket", AvailableQuantity = 12500, Status = TicketTypeStatus.Active, ZoneId = 20, EventId = 4 },
                
                // Event 5: Jazz & Blues Evening (Sava Center - Venue 6) - Zones 21-23
                new TicketType { Name = "Orchestra Premium - Jazz", Description = "Premium orchestra seating", AvailableQuantity = 950, Status = TicketTypeStatus.Active, ZoneId = 21, EventId = 5 },
                new TicketType { Name = "Orchestra Standard - Jazz", Description = "Standard orchestra seating", AvailableQuantity = 950, Status = TicketTypeStatus.Active, ZoneId = 22, EventId = 5 },
                new TicketType { Name = "Balcony - Jazz", Description = "Balcony level seating", AvailableQuantity = 1900, Status = TicketTypeStatus.Active, ZoneId = 23, EventId = 5 },
                
                // Event 6: Nisville Jazz Festival (Venue 7) - Zones 24-25
                new TicketType { Name = "Jazz Front Stage", Description = "Front of jazz stage access", AvailableQuantity = 1900, Status = TicketTypeStatus.Active, ZoneId = 24, EventId = 6 },
                new TicketType { Name = "Jazz Festival General", Description = "General festival access", AvailableQuantity = 5700, Status = TicketTypeStatus.Active, ZoneId = 25, EventId = 6 },
                
                // Event 7: Underground Electronic (Drugstore - Venue 8) - Zones 26-27
                new TicketType { Name = "DJ Booth VIP", Description = "Close to DJ booth experience", AvailableQuantity = 280, Status = TicketTypeStatus.Active, ZoneId = 26, EventId = 7 },
                new TicketType { Name = "Club General", Description = "General club access", AvailableQuantity = 480, Status = TicketTypeStatus.Active, ZoneId = 27, EventId = 7 },
                
                // Event 8: Summer Stadium Concert (Tašmajdan - Venue 9) - Zones 28-29
                new TicketType { Name = "Stadium Floor - Summer", Description = "Main stadium floor standing", AvailableQuantity = 23800, Status = TicketTypeStatus.Active, ZoneId = 28, EventId = 8 },
                new TicketType { Name = "Stadium Seats - Summer", Description = "Stadium seating with great view", AvailableQuantity = 9500, Status = TicketTypeStatus.Active, ZoneId = 29, EventId = 8 }
            };
            context.TicketTypes.AddRange(ticketTypes);
            await context.SaveChangesAsync();

            // 10. Seed Tickets
            var tickets = new List<Ticket>();
            foreach (var ticketType in ticketTypes)
            {
                int ticketsToCreate = random.Next(20, 100); // 20-100 tickets per type
                var zone = zones.First(z => z.ZoneId == ticketType.ZoneId);

                for (int i = 0; i < ticketsToCreate; i++)
                {
                    var priceVariation = (decimal)(random.NextDouble() * 0.3 - 0.15); // -15% to +15%
                    var finalPrice = zone.BasePrice + zone.BasePrice * priceVariation;
                    if (finalPrice < zone.BasePrice * 0.85m) finalPrice = zone.BasePrice * 0.85m;

                    var ticketStatuses = new[] {
                        TicketStatus.Available, TicketStatus.Available, TicketStatus.Available, TicketStatus.Available,
                        TicketStatus.Reserved, TicketStatus.Sold, TicketStatus.Sold
                    };

                    tickets.Add(new Ticket
                    {
                        UniqueCode = $"TKT-{ticketType.TicketTypeId:D3}-{DateTime.Now:yyyyMMdd}-{i + 1:D4}",
                        QrCode = Guid.NewGuid().ToString(),
                        IssueDate = DateTime.UtcNow.AddDays(-random.Next(1, 60)),
                        FinalPrice = Math.Round(finalPrice, 0),
                        Status = ticketStatuses[random.Next(ticketStatuses.Length)],
                        TicketTypeId = ticketType.TicketTypeId
                    });
                }
            }
            context.Tickets.AddRange(tickets);
            await context.SaveChangesAsync();

            // 11. Seed Performers
            var performers = new List<Performer>
            {
                new Performer
                {
                    Name = "Arctic Monkeys",
                    Email = "booking@arcticmonkeys.com",
                    Contact = "+44 20 7946 0958",
                    Genre = "Indie Rock",
                    Popularity = 95,
                    TechnicalRequirements = "Full light rig, 32-channel mixing desk, wireless IEM system",
                    MinPrice = 150000,
                    MaxPrice = 300000,
                    AverageResponseTime = TimeSpan.FromHours(24),
                    Status = "Available",
                    UpdatedAt = DateTime.UtcNow
                },
                new Performer
                {
                    Name = "Disclosure",
                    Email = "management@disclosure.co.uk",
                    Contact = "+44 20 8123 4567",
                    Genre = "Electronic",
                    Popularity = 88,
                    TechnicalRequirements = "DJ setup, LED screen, smoke machines, wireless microphones",
                    MinPrice = 80000,
                    MaxPrice = 180000,
                    AverageResponseTime = TimeSpan.FromHours(12),
                    Status = "Available",
                    UpdatedAt = DateTime.UtcNow
                },
                new Performer
                {
                    Name = "Goran Bregović",
                    Email = "office@bregovic.rs",
                    Contact = "+381 11 234 5678",
                    Genre = "World Music",
                    Popularity = 92,
                    TechnicalRequirements = "Orchestra setup, 16 wireless microphones, traditional instruments amplification",
                    MinPrice = 45000,
                    MaxPrice = 120000,
                    AverageResponseTime = TimeSpan.FromHours(48),
                    Status = "Busy",
                    UpdatedAt = DateTime.UtcNow
                },
                new Performer
                {
                    Name = "Dubioza Kolektiv",
                    Email = "booking@dubioza.ba",
                    Contact = "+387 33 567 890",
                    Genre = "Ska Punk",
                    Popularity = 78,
                    TechnicalRequirements = "Full band setup, horn section amplification, video projection",
                    MinPrice = 25000,
                    MaxPrice = 65000,
                    AverageResponseTime = TimeSpan.FromHours(18),
                    Status = "Available",
                    UpdatedAt = DateTime.UtcNow
                },
                new Performer
                {
                    Name = "Nina Kraviz",
                    Email = "booking@ninakraviz.com",
                    Contact = "+49 30 1234 5678",
                    Genre = "Techno",
                    Popularity = 85,
                    TechnicalRequirements = "Pioneer CDJ setup, Allen & Heath mixer, professional monitoring",
                    MinPrice = 35000,
                    MaxPrice = 85000,
                    AverageResponseTime = TimeSpan.FromHours(6),
                    Status = "Available",
                    UpdatedAt = DateTime.UtcNow
                },
                new Performer
                {
                    Name = "Bojan Marović Trio",
                    Email = "info@bojanmarovic.com",
                    Contact = "+381 11 345 6789",
                    Genre = "Jazz",
                    Popularity = 72,
                    TechnicalRequirements = "Acoustic piano, drum kit, bass amplification, intimate lighting",
                    MinPrice = 8000,
                    MaxPrice = 25000,
                    AverageResponseTime = TimeSpan.FromHours(36),
                    Status = "Available",
                    UpdatedAt = DateTime.UtcNow
                },
                new Performer
                {
                    Name = "Charlotte de Witte",
                    Email = "booking@charlottedewitte.com",
                    Contact = "+32 2 123 4567",
                    Genre = "Techno",
                    Popularity = 89,
                    TechnicalRequirements = "Professional DJ setup, smoke machines, laser system",
                    MinPrice = 50000,
                    MaxPrice = 120000,
                    AverageResponseTime = TimeSpan.FromHours(8),
                    Status = "Available",
                    UpdatedAt = DateTime.UtcNow
                },
                new Performer
                {
                    Name = "Local Underground Collective",
                    Email = "contact@undergroundcollective.rs",
                    Contact = "+381 64 123 4567",
                    Genre = "Alternative Hip-Hop",
                    Popularity = 45,
                    TechnicalRequirements = "DJ setup, 4 wireless mics, basic lighting, laptop connection",
                    MinPrice = 3000,
                    MaxPrice = 12000,
                    AverageResponseTime = TimeSpan.FromHours(8),
                    Status = "Available",
                    UpdatedAt = DateTime.UtcNow
                },
                new Performer
                {
                    Name = "The Comet Is Coming",
                    Email = "booking@thecometiscoming.com",
                    Contact = "+44 20 3456 7890",
                    Genre = "Jazz Fusion",
                    Popularity = 76,
                    TechnicalRequirements = "Full band setup, synthesizer connections, atmospheric lighting",
                    MinPrice = 20000,
                    MaxPrice = 55000,
                    AverageResponseTime = TimeSpan.FromHours(20),
                    Status = "Available",
                    UpdatedAt = DateTime.UtcNow
                },
                new Performer
                {
                    Name = "Fontaines D.C.",
                    Email = "management@fontainesdc.com",
                    Contact = "+353 1 234 5678",
                    Genre = "Post-Punk",
                    Popularity = 82,
                    TechnicalRequirements = "Full band backline, vintage amps, professional monitoring",
                    MinPrice = 60000,
                    MaxPrice = 140000,
                    AverageResponseTime = TimeSpan.FromHours(16),
                    Status = "Available",
                    UpdatedAt = DateTime.UtcNow
                }
            };
            context.Performers.AddRange(performers);
            await context.SaveChangesAsync();

            // 12. Seed Performances
            var performances = new List<Performance>
            {
                // Rock Legends Live - Belgrade Arena (Venue 1)
                new Performance
                {
                    PerformerId = 1, // Arctic Monkeys
                    VenueId = 1,
                    StartTime = events[0].StartDate.AddHours(20),
                    EndTime = events[0].StartDate.AddHours(22).AddMinutes(30),
                    SetupTime = 120, // 2 hours
                    SoundcheckTime = 60, // 1 hour
                    Status = PerformanceStatus.Planned,
                    CreatedAt = DateTime.UtcNow.AddDays(-30),
                    UpdatedAt = DateTime.UtcNow.AddDays(-5)
                },
                new Performance
                {
                    PerformerId = 10, // Fontaines D.C.
                    VenueId = 1,
                    StartTime = events[0].StartDate.AddHours(18),
                    EndTime = events[0].StartDate.AddHours(19).AddMinutes(30),
                    SetupTime = 90,
                    SoundcheckTime = 45,
                    Status = PerformanceStatus.Planned,
                    CreatedAt = DateTime.UtcNow.AddDays(-25),
                    UpdatedAt = DateTime.UtcNow.AddDays(-5)
                },
                
                // Indie Discovery Night - Youth Center (Venue 2)
                new Performance
                {
                    PerformerId = 4, // Dubioza Kolektiv
                    VenueId = 2,
                    StartTime = events[1].StartDate.AddHours(21),
                    EndTime = events[1].StartDate.AddHours(23),
                    SetupTime = 60,
                    SoundcheckTime = 30,
                    Status = PerformanceStatus.InProgress,
                    CreatedAt = DateTime.UtcNow.AddDays(-20),
                    UpdatedAt = DateTime.UtcNow.AddDays(-2)
                },
                new Performance
                {
                    PerformerId = 8, // Local Underground Collective
                    VenueId = 2,
                    StartTime = events[1].StartDate.AddHours(19),
                    EndTime = events[1].StartDate.AddHours(20).AddMinutes(30),
                    SetupTime = 30,
                    SoundcheckTime = 20,
                    Status = PerformanceStatus.Completed,
                    CreatedAt = DateTime.UtcNow.AddDays(-18),
                    UpdatedAt = DateTime.UtcNow.AddDays(-2)
                },
                
                // Electronic Waves - Stark Arena (Venue 3)
                new Performance
                {
                    PerformerId = 2, // Disclosure
                    VenueId = 3,
                    StartTime = events[2].StartDate.AddHours(22),
                    EndTime = events[2].StartDate.AddDays(1).AddHours(1),
                    SetupTime = 90,
                    SoundcheckTime = 45,
                    Status = PerformanceStatus.Planned,
                    CreatedAt = DateTime.UtcNow.AddDays(-35),
                    UpdatedAt = DateTime.UtcNow.AddDays(-10)
                },
                new Performance
                {
                    PerformerId = 5, // Nina Kraviz
                    VenueId = 3,
                    StartTime = events[2].StartDate.AddHours(19),
                    EndTime = events[2].StartDate.AddHours(21).AddMinutes(30),
                    SetupTime = 60,
                    SoundcheckTime = 30,
                    Status = PerformanceStatus.Planned,
                    CreatedAt = DateTime.UtcNow.AddDays(-33),
                    UpdatedAt = DateTime.UtcNow.AddDays(-10)
                },
                new Performance
                {
                    PerformerId = 7, // Charlotte de Witte
                    VenueId = 3,
                    StartTime = events[2].StartDate.AddDays(1).AddHours(1),
                    EndTime = events[2].StartDate.AddDays(1).AddHours(3).AddMinutes(30),
                    SetupTime = 45,
                    SoundcheckTime = 30,
                    Status = PerformanceStatus.Planned,
                    CreatedAt = DateTime.UtcNow.AddDays(-32),
                    UpdatedAt = DateTime.UtcNow.AddDays(-10)
                },
                
                // Exit Festival - Main Stage (Venue 4)
                new Performance
                {
                    PerformerId = 1, // Arctic Monkeys
                    VenueId = 4,
                    StartTime = events[3].StartDate.AddDays(2).AddHours(23),
                    EndTime = events[3].StartDate.AddDays(3).AddHours(1),
                    SetupTime = 120,
                    SoundcheckTime = 60,
                    Status = PerformanceStatus.Planned,
                    CreatedAt = DateTime.UtcNow.AddDays(-60),
                    UpdatedAt = DateTime.UtcNow.AddDays(-15)
                },
                new Performance
                {
                    PerformerId = 3, // Goran Bregović
                    VenueId = 4,
                    StartTime = events[3].StartDate.AddDays(1).AddHours(21),
                    EndTime = events[3].StartDate.AddDays(1).AddHours(23),
                    SetupTime = 150,
                    SoundcheckTime = 90,
                    Status = PerformanceStatus.Planned,
                    CreatedAt = DateTime.UtcNow.AddDays(-55),
                    UpdatedAt = DateTime.UtcNow.AddDays(-15)
                },
                
                // Exit Festival - Dance Arena (Venue 5)
                new Performance
                {
                    PerformerId = 5, // Nina Kraviz
                    VenueId = 5,
                    StartTime = events[3].StartDate.AddDays(1).AddHours(2),
                    EndTime = events[3].StartDate.AddDays(1).AddHours(4),
                    SetupTime = 45,
                    SoundcheckTime = 30,
                    Status = PerformanceStatus.Planned,
                    CreatedAt = DateTime.UtcNow.AddDays(-58),
                    UpdatedAt = DateTime.UtcNow.AddDays(-15)
                },
                new Performance
                {
                    PerformerId = 7, // Charlotte de Witte
                    VenueId = 5,
                    StartTime = events[3].StartDate.AddDays(2).AddHours(1),
                    EndTime = events[3].StartDate.AddDays(2).AddHours(3).AddMinutes(30),
                    SetupTime = 45,
                    SoundcheckTime = 30,
                    Status = PerformanceStatus.Planned,
                    CreatedAt = DateTime.UtcNow.AddDays(-57),
                    UpdatedAt = DateTime.UtcNow.AddDays(-15)
                },
                
                // Jazz & Blues Evening - Sava Center (Venue 6)
                new Performance
                {
                    PerformerId = 6, // Bojan Marović Trio
                    VenueId = 6,
                    StartTime = events[4].StartDate.AddHours(20),
                    EndTime = events[4].StartDate.AddHours(22).AddMinutes(30),
                    SetupTime = 60,
                    SoundcheckTime = 45,
                    Status = PerformanceStatus.Completed,
                    CreatedAt = DateTime.UtcNow.AddDays(-25),
                    UpdatedAt = DateTime.UtcNow.AddDays(-3)
                },
                new Performance
                {
                    PerformerId = 9, // The Comet Is Coming
                    VenueId = 6,
                    StartTime = events[4].StartDate.AddHours(18),
                    EndTime = events[4].StartDate.AddHours(19).AddMinutes(45),
                    SetupTime = 75,
                    SoundcheckTime = 40,
                    Status = PerformanceStatus.Planned,
                    CreatedAt = DateTime.UtcNow.AddDays(-23),
                    UpdatedAt = DateTime.UtcNow.AddDays(-3)
                },
                
                // Nisville Jazz Festival (Venue 7)
                new Performance
                {
                    PerformerId = 6, // Bojan Marović Trio
                    VenueId = 7,
                    StartTime = events[5].StartDate.AddDays(1).AddHours(19),
                    EndTime = events[5].StartDate.AddDays(1).AddHours(20).AddMinutes(45),
                    SetupTime = 60,
                    SoundcheckTime = 45,
                    Status = PerformanceStatus.Planned,
                    CreatedAt = DateTime.UtcNow.AddDays(-40),
                    UpdatedAt = DateTime.UtcNow.AddDays(-15)
                },
                new Performance
                {
                    PerformerId = 9, // The Comet Is Coming
                    VenueId = 7,
                    StartTime = events[5].StartDate.AddDays(2).AddHours(21),
                    EndTime = events[5].StartDate.AddDays(2).AddHours(23),
                    SetupTime = 75,
                    SoundcheckTime = 40,
                    Status = PerformanceStatus.Planned,
                    CreatedAt = DateTime.UtcNow.AddDays(-38),
                    UpdatedAt = DateTime.UtcNow.AddDays(-15)
                },
                
                // Underground Electronic - Drugstore (Venue 8)
                new Performance
                {
                    PerformerId = 5, // Nina Kraviz
                    VenueId = 8,
                    StartTime = events[6].StartDate.AddHours(23),
                    EndTime = events[6].StartDate.AddDays(1).AddHours(4),
                    SetupTime = 45,
                    SoundcheckTime = 30,
                    Status = PerformanceStatus.Completed,
                    CreatedAt = DateTime.UtcNow.AddDays(-15),
                    UpdatedAt = DateTime.UtcNow.AddDays(-1)
                },
                
                // Summer Stadium Concert - Tašmajdan (Venue 9)
                new Performance
                {
                    PerformerId = 1, // Arctic Monkeys
                    VenueId = 9,
                    StartTime = events[7].StartDate.AddHours(21),
                    EndTime = events[7].StartDate.AddHours(23),
                    SetupTime = 180,
                    SoundcheckTime = 90,
                    Status = PerformanceStatus.Planned,
                    CreatedAt = DateTime.UtcNow.AddDays(-30),
                    UpdatedAt = DateTime.UtcNow.AddDays(-8)
                },
                new Performance
                {
                    PerformerId = 10, // Fontaines D.C.
                    VenueId = 9,
                    StartTime = events[7].StartDate.AddHours(19),
                    EndTime = events[7].StartDate.AddHours(20).AddMinutes(30),
                    SetupTime = 90,
                    SoundcheckTime = 45,
                    Status = PerformanceStatus.Planned,
                    CreatedAt = DateTime.UtcNow.AddDays(-28),
                    UpdatedAt = DateTime.UtcNow.AddDays(-8)
                },
                new Performance
                {
                    PerformerId = 4, // Dubioza Kolektiv
                    VenueId = 9,
                    StartTime = events[7].StartDate.AddHours(17),
                    EndTime = events[7].StartDate.AddHours(18).AddMinutes(30),
                    SetupTime = 60,
                    SoundcheckTime = 30,
                    Status = PerformanceStatus.Planned,
                    CreatedAt = DateTime.UtcNow.AddDays(-26),
                    UpdatedAt = DateTime.UtcNow.AddDays(-8)
                }
            };
            context.Performances.AddRange(performances);
            await context.SaveChangesAsync();

            // 13. Seed RecordedSales
            var recordedSales = new List<RecordedSale>();
            var paymentMethods = new[] { PaymentMethod.CreditCard, PaymentMethod.DebitCard, PaymentMethod.BankTransfer, PaymentMethod.PayPal };
            var statuses = new[] {
                TransactionStatus.Completed, TransactionStatus.Completed, TransactionStatus.Completed, TransactionStatus.Completed,
                TransactionStatus.Pending, TransactionStatus.Failed
            };

            var soldTickets = tickets.Where(t => t.Status == TicketStatus.Sold || t.Status == TicketStatus.Reserved).ToList();
            var availableTicketsForSale = new List<Ticket>(soldTickets);

            for (int i = 0; i < 75; i++) // 75 recorded sales
            {
                if (availableTicketsForSale.Count == 0) break;

                var user = applicationUsers[random.Next(applicationUsers.Count)];
                var saleDate = DateTime.UtcNow.AddDays(-random.Next(1, 90));
                var ticketsInSale = new List<Ticket>();
                var specialOffersInSale = new List<SpecialOffer>();

                // Select 1-5 tickets for this sale
                var ticketsToAdd = random.Next(1, 6);
                for (int j = 0; j < Math.Min(ticketsToAdd, availableTicketsForSale.Count); j++)
                {
                    var ticket = availableTicketsForSale[random.Next(availableTicketsForSale.Count)];
                    ticketsInSale.Add(ticket);
                    availableTicketsForSale.Remove(ticket);
                }

                if (ticketsInSale.Count == 0) continue;

                // Randomly apply 0-2 special offers
                var offersToAdd = random.Next(0, 3);
                for (int k = 0; k < offersToAdd; k++)
                {
                    var offer = specialOffers[random.Next(specialOffers.Count)];
                    if (!specialOffersInSale.Contains(offer))
                        specialOffersInSale.Add(offer);
                }

                var totalAmount = ticketsInSale.Sum(t => t.FinalPrice);

                // Apply special offer discounts
                foreach (var offer in specialOffersInSale)
                {
                    totalAmount -= totalAmount * (offer.DiscountValue / 100);
                }

                totalAmount = Math.Max(totalAmount, 0);

                var transactionStatus = statuses[random.Next(statuses.Length)];

                var recordedSale = new RecordedSale
                {
                    TotalAmount = Math.Round(totalAmount, 2),
                    SaleDate = saleDate,
                    TransactionStatus = transactionStatus,
                    PaymentMethod = paymentMethods[random.Next(paymentMethods.Length)],
                    ApplicationUserId = user.Id,
                    Tickets = ticketsInSale,
                    SpecialOffers = specialOffersInSale
                };

                recordedSales.Add(recordedSale);

                // Update ticket statuses based on transaction
                foreach (var ticket in ticketsInSale)
                {
                    ticket.Status = transactionStatus == TransactionStatus.Completed ? TicketStatus.Sold :
                                   transactionStatus == TransactionStatus.Failed ? TicketStatus.Available :
                                   TicketStatus.Reserved;
                }
            }

            context.RecordedSales.AddRange(recordedSales);
            await context.SaveChangesAsync();

            // Update tickets with their RecordedSaleId
            foreach (var sale in recordedSales)
            {
                foreach (var ticket in sale.Tickets)
                {
                    ticket.RecordedSaleId = sale.RecordedSaleId;
                }
            }
            await context.SaveChangesAsync();

            // Link many-to-many relationships

            // Link PricingRules to Events (select random pricing rules for each event)
            foreach (var evt in events)
            {
                var rulesToAdd = random.Next(1, 4); // 1-3 pricing rules per event
                var selectedRules = pricingRules.OrderBy(x => random.Next()).Take(rulesToAdd).ToList();
                foreach (var rule in selectedRules)
                {
                    evt.PricingRules.Add(rule);
                }
            }

            // Link PricingRules to TicketTypes (select random pricing rules for each ticket type)
            foreach (var ticketType in ticketTypes)
            {
                var rulesToAdd = random.Next(1, 3); // 1-2 pricing rules per ticket type
                var selectedRules = pricingRules.OrderBy(x => random.Next()).Take(rulesToAdd).ToList();
                foreach (var rule in selectedRules)
                {
                    ticketType.PricingRules.Add(rule);
                }
            }

            // Link SpecialOffers to TicketTypes (some offers apply to specific ticket types)
            foreach (var offer in specialOffers.Take(6)) // First 6 offers
            {
                var ticketTypesToAdd = random.Next(2, 6); // 2-5 ticket types per offer
                var selectedTicketTypes = ticketTypes.OrderBy(x => random.Next()).Take(ticketTypesToAdd).ToList();
                foreach (var tt in selectedTicketTypes)
                {
                    offer.TicketTypes.Add(tt);
                }
            }

            await context.SaveChangesAsync();

            Console.WriteLine("=== Database Seeding Completed Successfully ===");
            Console.WriteLine($"✓ {applicationUsers.Count} Application Users");
            Console.WriteLine($"✓ {locations.Count} Locations");
            Console.WriteLine($"✓ {events.Count} Events");
            Console.WriteLine($"✓ {venues.Count} Venues");
            Console.WriteLine($"✓ {segments.Count} Segments");
            Console.WriteLine($"✓ {zones.Count} Zones");
            Console.WriteLine($"✓ {pricingRules.Count} Pricing Rules");
            Console.WriteLine($"✓ {specialOffers.Count} Special Offers");
            Console.WriteLine($"✓ {ticketTypes.Count} Ticket Types");
            Console.WriteLine($"✓ {tickets.Count} Individual Tickets");
            Console.WriteLine($"✓ {performers.Count} Performers");
            Console.WriteLine($"✓ {performances.Count} Performances");
            Console.WriteLine($"✓ {recordedSales.Count} Recorded Sales");
            Console.WriteLine("=============================================");
        }
    }
}