using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.Models.Auth;
using System.Reflection.Emit;

namespace MusicEventManagementSystem.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        // DbSets for Ticket-Sales Subsystem
        public DbSet<Venue> Venues { get; set; }
        public DbSet<Segment> Segments { get; set; }
        public DbSet<Zone> Zones { get; set; }
        public DbSet<SpecialOffer> SpecialOffers { get; set; }
        public DbSet<TicketType> TicketTypes { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<RecordedSale> RecordedSales { get; set; }
        public DbSet<PricingRule> PricingRules { get; set; }

        // DbSets for Performer Subsystem
        public DbSet<Performer> Performers { get; set; }
        public DbSet<Requirement> Requirements { get; set; }
        public DbSet<Phase> Phases { get; set; }
        public DbSet<Negotiation> Negotiations { get; set; }
        public DbSet<NegotiationPhase> NegotiationPhases { get; set; }
        public DbSet<NegotiationRequirementFulfillment> NegotiationRequirementFulfillments { get; set; }
        public DbSet<Contract> Contracts { get; set; }
        public DbSet<Document> Documents { get; set; }
        public DbSet<Communication> Communications { get; set; }
        public DbSet<NegotiationUser> NegotiationUsers { get; set; }

        // DbSets za Event Management podsistem
        public DbSet<Event> Events { get; set; }
        public DbSet<Resource> Resources { get; set; }
        public DbSet<Equipment> Equipment { get; set; }
        public DbSet<Location> Locations { get; set; }
        public DbSet<Performance> Performances { get; set; }
        public DbSet<PerformanceResource> PerformanceResources { get; set; }
        public DbSet<WorkTask> WorkTasks { get; set; }
        public DbSet<Vehicle> Vehicles { get; set; }
        public DbSet<Staff> Staff { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<Infrastructure> Infrastructures { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            // Ticket-Sales Subsystem configurations
            // Configuring enum fields to be stored as integers
            builder.Entity<Venue>()
                .Property(v => v.VenueType)
                .HasConversion<int>();

            builder.Entity<Segment>()
                .Property(s => s.SegmentType)
                .HasConversion<int>();

            builder.Entity<Zone>()
                .Property(z => z.Position)
                .HasConversion<int>();

            builder.Entity<Ticket>()
                .Property(t => t.Status)
                .HasConversion<int>();

            builder.Entity<TicketType>()
                .Property(tt =>tt.Status)
                .HasConversion<int>();

            builder.Entity<SpecialOffer>()
                .Property(so => so.OfferType)
                .HasConversion<int>();

            builder.Entity<PricingRule>()
                .Property(pr => pr.PricingCondition)
                .HasConversion<int>();

            builder.Entity<RecordedSale>()
                .Property(rs => rs.PaymentMethod)
                .HasConversion<int>();

            builder.Entity<RecordedSale>()
                .Property(rs => rs.TransactionStatus)
                .HasConversion<int>();


            // Configure Negotiation relationships
            
            // One-to-One: Negotiation has one Event
            builder.Entity<Negotiation>()
                .HasOne(n => n.Event)
                .WithOne(e => e.Negotiation)
                .HasForeignKey<Negotiation>(n => n.EventId)
                .OnDelete(DeleteBehavior.Restrict);

            // One-to-One: Negotiation has one Performer
            builder.Entity<Negotiation>()
                .HasOne(n => n.Performer)
                .WithOne(p => p.Negotiation)
                .HasForeignKey<Negotiation>(n => n.PerformerId)
                .OnDelete(DeleteBehavior.Restrict);

            // One-to-One: Negotiation has one Communication (Communication is dependent)
            builder.Entity<Communication>()
                .HasOne(c => c.Negotiation)
                .WithOne(n => n.Communication)
                .HasForeignKey<Communication>(c => c.NegotiationId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure new phase relationships
            
            // Many-to-Many: Negotiation and Phases through NegotiationPhase
            builder.Entity<NegotiationPhase>()
                .HasKey(np => new { np.NegotiationId, np.PhaseId });

            builder.Entity<NegotiationPhase>()
                .HasOne(np => np.Negotiation)
                .WithMany(n => n.NegotiationPhases)
                .HasForeignKey(np => np.NegotiationId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<NegotiationPhase>()
                .HasOne(np => np.Phase)
                .WithMany(p => p.NegotiationPhases)
                .HasForeignKey(np => np.PhaseId)
                .OnDelete(DeleteBehavior.Cascade);

            // One-to-Many: Negotiation has many Documents
            builder.Entity<Document>()
                .HasOne(d => d.Negotiation)
                .WithMany(n => n.Documents)
                .HasForeignKey(d => d.NegotiationId)
                .OnDelete(DeleteBehavior.Cascade);

            // Many-to-Many: Negotiation and Users through NegotiationUser
            builder.Entity<NegotiationUser>()
                .HasKey(nu => new { nu.NegotiationId, nu.UserId });

            builder.Entity<NegotiationUser>()
                .HasOne(nu => nu.Negotiation)
                .WithMany(n => n.Users)
                .HasForeignKey(nu => nu.NegotiationId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<NegotiationUser>()
                .HasOne(nu => nu.User)
                .WithMany()
                .HasForeignKey(nu => nu.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // One-to-Many: Performer has many Contracts
            builder.Entity<Contract>()
                .HasOne(c => c.Performer)
                .WithMany(p => p.Contracts)
                .HasForeignKey(c => c.PerformerId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure NegotiationRequirementFulfillment
            builder.Entity<NegotiationRequirementFulfillment>()
                .HasKey(nrf => nrf.FulfillmentId);

            builder.Entity<NegotiationRequirementFulfillment>()
                .HasOne(nrf => nrf.Negotiation)
                .WithMany(n => n.RequirementFulfillments)
                .HasForeignKey(nrf => nrf.NegotiationId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<NegotiationRequirementFulfillment>()
                .HasOne(nrf => nrf.Phase)
                .WithMany()
                .HasForeignKey(nrf => nrf.PhaseId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<NegotiationRequirementFulfillment>()
                .HasOne(nrf => nrf.Requirement)
                .WithMany(r => r.Fulfillments)
                .HasForeignKey(nrf => nrf.RequirementId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<NegotiationRequirementFulfillment>()
                .HasOne(nrf => nrf.NegotiationPhase)
                .WithMany(np => np.RequirementFulfillments)
                .HasForeignKey(nrf => new { nrf.NegotiationId, nrf.PhaseId })
                .OnDelete(DeleteBehavior.Cascade);

            // One-to-Many: Phase has many Requirements
            builder.Entity<Requirement>()
                .HasOne(r => r.Phase)
                .WithMany(p => p.Requirements)
                .HasForeignKey(r => r.PhaseId)
                .OnDelete(DeleteBehavior.Cascade);

            // One-To-Many relationships for Ticket-Sales Subsystem

            builder.Entity<Ticket>()
                .HasOne(t => t.RecordedSale)
                .WithMany(rs => rs.Tickets)
                .HasForeignKey(t => t.RecordedSaleId)
                .IsRequired(false);

            // Many-To-Many relationships for Ticket-Sales Subsystem

            builder.Entity<TicketType>()
                .HasMany(tt => tt.SpecialOffers)
                .WithMany(so => so.TicketTypes)
                .UsingEntity(j => j.ToTable("TicketTypeSpecialOffers"));

            builder.Entity<TicketType>()
                .HasMany(tt => tt.PricingRules)
                .WithMany(pr => pr.TicketTypes)
                .UsingEntity(j => j.ToTable("TicketTypePricingRules"));

            builder.Entity<Event>()
                .HasMany(d => d.PricingRules)
                .WithMany(pr => pr.Events)
                .UsingEntity(j => j.ToTable("EventPricingRules"));

            builder.Entity<RecordedSale>()
                .HasMany(rs => rs.SpecialOffers)
                .WithMany(so => so.RecordedSales)
                .UsingEntity(j => j.ToTable("RecordedSaleSpecialOffers"));

            // Seed data for fixed phases
            SeedPhases(builder);

            base.OnModelCreating(builder);
        }

        private void SeedPhases(ModelBuilder builder)
        {
            // Seed the 5 fixed phases
            builder.Entity<Phase>().HasData(
                new Phase
                {
                    PhaseId = 1,
                    PhaseName = "Initial Outreach",
                    OrderNumber = 1,
                    EstimatedDuration = 7,
                    IsGlobal = true
                },
                new Phase
                {
                    PhaseId = 2,
                    PhaseName = "Preliminary Negotiations",
                    OrderNumber = 2,
                    EstimatedDuration = 14,
                    IsGlobal = true
                },
                new Phase
                {
                    PhaseId = 3,
                    PhaseName = "Contract Negotiations",
                    OrderNumber = 3,
                    EstimatedDuration = 21,
                    IsGlobal = true
                },
                new Phase
                {
                    PhaseId = 4,
                    PhaseName = "Contract Draft",
                    OrderNumber = 4,
                    EstimatedDuration = 10,
                    IsGlobal = true
                },
                new Phase
                {
                    PhaseId = 5,
                    PhaseName = "Final Agreement",
                    OrderNumber = 5,
                    EstimatedDuration = 5,
                    IsGlobal = true
                }
            );

            // Seed default requirements for each phase
            var now = DateTime.UtcNow;
            builder.Entity<Requirement>().HasData(
                // Phase 1: Initial Outreach
                new Requirement { RequirementId = 1, PhaseId = 1, Title = "Contact Performer", Description = "Initial contact with performer representatives", IsRequired = true, CreatedAt = now, UpdatedAt = now },
                new Requirement { RequirementId = 2, PhaseId = 1, Title = "Verify Availability", Description = "Confirm performer availability for event dates", IsRequired = true, CreatedAt = now, UpdatedAt = now },
                new Requirement { RequirementId = 3, PhaseId = 1, Title = "Provide Event Details", Description = "Share comprehensive event information", IsRequired = true, CreatedAt = now, UpdatedAt = now },

                // Phase 2: Preliminary Negotiations
                new Requirement { RequirementId = 4, PhaseId = 2, Title = "Fee Discussion", Description = "Initial fee and compensation discussions", IsRequired = true, CreatedAt = now, UpdatedAt = now },
                new Requirement { RequirementId = 5, PhaseId = 2, Title = "Technical Requirements", Description = "Discuss technical and venue requirements", IsRequired = true, CreatedAt = now, UpdatedAt = now },
                new Requirement { RequirementId = 6, PhaseId = 2, Title = "Schedule Coordination", Description = "Coordinate scheduling and logistics", IsRequired = true, CreatedAt = now, UpdatedAt = now },

                // Phase 3: Contract Negotiations
                new Requirement { RequirementId = 7, PhaseId = 3, Title = "Contract Terms", Description = "Negotiate detailed contract terms", IsRequired = true, CreatedAt = now, UpdatedAt = now },
                new Requirement { RequirementId = 8, PhaseId = 3, Title = "Legal Review", Description = "Legal team review of contract terms", IsRequired = true, CreatedAt = now, UpdatedAt = now },
                new Requirement { RequirementId = 9, PhaseId = 3, Title = "Rider Negotiations", Description = "Negotiate technical and hospitality riders", IsRequired = true, CreatedAt = now, UpdatedAt = now },

                // Phase 4: Contract Draft
                new Requirement { RequirementId = 10, PhaseId = 4, Title = "Draft Preparation", Description = "Prepare final contract draft", IsRequired = true, CreatedAt = now, UpdatedAt = now },
                new Requirement { RequirementId = 11, PhaseId = 4, Title = "Stakeholder Review", Description = "All stakeholders review draft", IsRequired = true, CreatedAt = now, UpdatedAt = now },
                new Requirement { RequirementId = 12, PhaseId = 4, Title = "Revisions", Description = "Incorporate any necessary revisions", IsRequired = false, CreatedAt = now, UpdatedAt = now },

                // Phase 5: Final Agreement
                new Requirement { RequirementId = 13, PhaseId = 5, Title = "Contract Signing", Description = "All parties sign the final contract", IsRequired = true, CreatedAt = now, UpdatedAt = now },
                new Requirement { RequirementId = 14, PhaseId = 5, Title = "Payment Schedule Setup", Description = "Establish payment schedule and methods", IsRequired = true, CreatedAt = now, UpdatedAt = now },
                new Requirement { RequirementId = 15, PhaseId = 5, Title = "Documentation Filing", Description = "File and distribute final documentation", IsRequired = true, CreatedAt = now, UpdatedAt = now }
            );

        }
    }
}
