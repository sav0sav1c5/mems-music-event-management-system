using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.Models.Auth;
using System.Threading.Channels;
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

        // DbSets for Media-Campaign Subsystem
        public DbSet<Campaign> Campaigns { get; set; }
        public DbSet<Ad> Ads { get; set; }
        public DbSet<MediaTask> MediaTasks { get; set; }
        public DbSet<MediaWorkflow> MediaWorkflows { get; set; }
        public DbSet<AdType> AdTypes { get; set; }
        public DbSet<MediaVersion> MediaVersions { get; set; }
        public DbSet<MediaChannel> Channels { get; set; }
        //public DbSet<IntegrationStatus> IntegrationStatuses { get; set; }
        public DbSet<Approval> Approvals { get; set; }

        // DbSets for Performer Subsystem
        public DbSet<Performer> Performers { get; set; }
        public DbSet<Requirement> Requirements { get; set; }
        public DbSet<Phase> Phases { get; set; }
        public DbSet<Negotiation> Negotiations { get; set; }
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


            // Configure Negotiation relationships
            
            // One-to-One: Negotiation has one Event
            //builder.Entity<Negotiation>()
            //    .HasOne(n => n.Event)
            //    .WithOne(e => e.Negotiation)
            //    .HasForeignKey<Negotiation>(n => n.EventId)
            //    .OnDelete(DeleteBehavior.Restrict);

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

            // One-to-Many: Negotiation has many Phases
            builder.Entity<Phase>()
                .HasOne(p => p.Negotiation)
                .WithMany(n => n.Phases)
                .HasForeignKey(p => p.NegotiationId)
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

            // One-to-One (optional): Contract has one Phase (nullable)
            builder.Entity<Phase>()
                .HasOne(p => p.Contract)
                .WithOne(c => c.Phase)
                .HasForeignKey<Phase>(p => p.ContractId)
                .OnDelete(DeleteBehavior.SetNull);

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

            // Conversion DateTime to UTC
            var dateTimeConverter = new ValueConverter<DateTime, DateTime>(
                v => v.Kind == DateTimeKind.Utc ? v : v.ToUniversalTime(),
                v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

            var nullableDateTimeConverter = new ValueConverter<DateTime?, DateTime?>(
                v => v.HasValue ? (v.Value.Kind == DateTimeKind.Utc ? v.Value : v.Value.ToUniversalTime()) : v,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v);

            foreach (var entityType in builder.Model.GetEntityTypes())
            {
                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType == typeof(DateTime))
                    {
                        builder.Entity(entityType.Name)
                            .Property(property.Name)
                            .HasConversion(dateTimeConverter);
                    }
                    else if (property.ClrType == typeof(DateTime?))
                    {
                        builder.Entity(entityType.Name)
                            .Property(property.Name)
                            .HasConversion(nullableDateTimeConverter);
                    }
                }
            }

            base.OnModelCreating(builder);

        }
    }
}
