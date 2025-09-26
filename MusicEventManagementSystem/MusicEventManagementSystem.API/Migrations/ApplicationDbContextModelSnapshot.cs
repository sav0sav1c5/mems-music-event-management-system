using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using MusicEventManagementSystem.Data;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace MusicEventManagementSystem.API.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    partial class ApplicationDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.18")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("EventPricingRule", b =>
                {
                    b.Property<int>("EventsId")
                        .HasColumnType("integer");

                    b.Property<int>("PricingRulesPricingRuleId")
                        .HasColumnType("integer");

                    b.HasKey("EventsId", "PricingRulesPricingRuleId");

                    b.HasIndex("PricingRulesPricingRuleId");

                    b.ToTable("EventPricingRules", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRole", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("text");

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .HasMaxLength(256)
                        .HasColumnType("character varying(256)");

                    b.Property<string>("NormalizedName")
                        .HasMaxLength(256)
                        .HasColumnType("character varying(256)");

                    b.HasKey("Id");

                    b.HasIndex("NormalizedName")
                        .IsUnique()
                        .HasDatabaseName("RoleNameIndex");

                    b.ToTable("AspNetRoles", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("ClaimType")
                        .HasColumnType("text");

                    b.Property<string>("ClaimValue")
                        .HasColumnType("text");

                    b.Property<string>("RoleId")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("RoleId");

                    b.ToTable("AspNetRoleClaims", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserClaim<string>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("ClaimType")
                        .HasColumnType("text");

                    b.Property<string>("ClaimValue")
                        .HasColumnType("text");

                    b.Property<string>("UserId")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("AspNetUserClaims", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserLogin<string>", b =>
                {
                    b.Property<string>("LoginProvider")
                        .HasColumnType("text");

                    b.Property<string>("ProviderKey")
                        .HasColumnType("text");

                    b.Property<string>("ProviderDisplayName")
                        .HasColumnType("text");

                    b.Property<string>("UserId")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("LoginProvider", "ProviderKey");

                    b.HasIndex("UserId");

                    b.ToTable("AspNetUserLogins", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserRole<string>", b =>
                {
                    b.Property<string>("UserId")
                        .HasColumnType("text");

                    b.Property<string>("RoleId")
                        .HasColumnType("text");

                    b.HasKey("UserId", "RoleId");

                    b.HasIndex("RoleId");

                    b.ToTable("AspNetUserRoles", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserToken<string>", b =>
                {
                    b.Property<string>("UserId")
                        .HasColumnType("text");

                    b.Property<string>("LoginProvider")
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .HasColumnType("text");

                    b.Property<string>("Value")
                        .HasColumnType("text");

                    b.HasKey("UserId", "LoginProvider", "Name");

                    b.ToTable("AspNetUserTokens", (string)null);
                });



            modelBuilder.Entity("MusicEventManagementSystem.API.Models.Ad", b =>

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.Communication", b =>
                {
                    b.Property<int>("CommunicationId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("CommunicationId"));

                    b.Property<string>("Content")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Direction")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("NegotiationId")
                        .HasColumnType("integer");

                    b.Property<DateTime?>("RepliedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<DateTime>("SentAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Type")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("CommunicationId");

                    b.HasIndex("NegotiationId")
                        .IsUnique();

                    b.ToTable("Communications");
                });

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.Contract", b =>
                {
                    b.Property<int>("ContractId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("ContractId"));

                    b.Property<string>("ContractType")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<int>("PerformerId")
                        .HasColumnType("integer");

                    b.Property<decimal>("Price")
                        .HasColumnType("numeric");

                    b.Property<DateTime?>("SignedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Version")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("ContractId");

                    b.HasIndex("PerformerId");

                    b.ToTable("Contracts");
                });

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.Document", b =>
                {
                    b.Property<int>("DocumentId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("DocumentId"));

                    b.Property<int>("NegotiationId")
                        .HasColumnType("integer");

                    b.Property<string>("Path")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Type")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime>("UpdatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Version")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("DocumentId");

                    b.HasIndex("NegotiationId");

                    b.ToTable("Documents");
                });

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.Equipment", b =>

                {
                    b.Property<int>("AdId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("AdId"));

                    b.Property<int>("AdTypeId")
                        .HasColumnType("integer");

                    b.Property<int>("CampaignId")
                        .HasColumnType("integer");

                    b.Property<DateTime>("CreationDate")
                        .HasColumnType("timestamp with time zone");

                    b.Property<int>("CurrentPhase")
                        .HasColumnType("integer");

                    b.Property<DateTime>("Deadline")
                        .HasColumnType("timestamp with time zone");

                    b.Property<int>("MediaWorkflowId")
                        .HasColumnType("integer");

                    b.Property<DateTime?>("PublicationDate")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Title")
                        .HasColumnType("text");

                    b.HasKey("AdId");

                    b.ToTable("Ads");
                });

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.AdType", b =>
                {
                    b.Property<int>("AdTypeId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("AdTypeId"));

                    b.Property<string>("Dimensions")
                        .HasColumnType("text");

                    b.Property<int>("Duration")
                        .HasColumnType("integer");

                    b.Property<string>("FileFormat")
                        .HasColumnType("text");

                    b.Property<string>("TypeDescription")
                        .HasColumnType("text");


                    b.Property<string>("TypeName")
                        .HasColumnType("text");

                    b.Property<DateTime>("EventInterval")
                        .HasColumnType("timestamp with time zone");


                    b.HasKey("AdTypeId");

                    b.ToTable("AdTypes");
                });

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.Approval", b =>
                {
                    b.Property<int>("ApprovalId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("ApprovalId"));

                    b.Property<DateTime>("ApprovalDate")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("ApprovalStatus")
                        .HasColumnType("text");

                    b.Property<string>("Comment")
                        .HasColumnType("text");

                    b.Property<int>("MediaTaskId")
                        .HasColumnType("integer");

                    b.HasKey("ApprovalId");

                    b.ToTable("Approvals");
                });

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.Campaign", b =>
                {
                    b.Property<int>("CampaignId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("CampaignId"));

                    b.Property<DateTime>("EndDate")
                        .HasColumnType("timestamp with time zone");

                    b.Property<int>("EventId")
                        .HasColumnType("integer");

                    modelBuilder.Entity("MusicEventManagementSystem.API.Models.Equipment", b =>
                        {
                            b.Property<int>("Id")
                                .ValueGeneratedOnAdd()
                                .HasColumnType("integer");

                            NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                            b.Property<string>("Model")
                                .IsRequired()
                                .HasColumnType("text");

                            b.Property<int>("PowerRequirements")
                                .HasColumnType("integer");

                            b.Property<bool>("RequiresSetup")
                                .HasColumnType("boolean");

                            b.Property<int>("ResourceId")
                                .HasColumnType("integer");

                            b.Property<string>("SerialNumber")
                                .IsRequired()
                                .HasColumnType("text");

                            b.HasKey("Id");

                            b.ToTable("Equipment");
                        });


                    modelBuilder.Entity("MusicEventManagementSystem.API.Models.Event", b =>
                        {
                            b.Property<int>("Id")
                                .ValueGeneratedOnAdd()
                                .HasColumnType("integer");

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.Negotiation", b =>
                {
                    b.Property<int>("NegotiationId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("NegotiationId"));

                    b.Property<DateTime>("EndDate")
                        .HasColumnType("timestamp with time zone");

                    b.Property<int>("EventId")
                        .HasColumnType("integer");

                    b.Property<int>("PerformerId")
                        .HasColumnType("integer");

                    b.Property<decimal>("ProposedFee")
                        .HasColumnType("numeric");

                    b.Property<DateTime>("StartDate")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("NegotiationId");

                    b.HasIndex("EventId")
                        .IsUnique();

                    b.HasIndex("PerformerId")
                        .IsUnique();

                    b.ToTable("Negotiations");
                });

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.NegotiationUser", b =>
                {
                    b.Property<int>("NegotiationId")
                        .HasColumnType("integer");

                    b.Property<string>("UserId")
                        .HasColumnType("text");

                    b.HasKey("NegotiationId", "UserId");

                    b.HasIndex("UserId");

                    b.ToTable("NegotiationUsers");
                });

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.Performance", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                            NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                            b.Property<DateTime>("CreatedAt")
                                .HasColumnType("timestamp with time zone");

                            b.Property<Guid>("CreatedById")
                                .HasColumnType("uuid");

                            b.Property<DateTime?>("DeletedAt")
                                .HasColumnType("timestamp with time zone");

                            b.Property<string>("Description")
                                .IsRequired()
                                .HasColumnType("text");

                            b.Property<DateTime>("Interval")
                                .HasColumnType("timestamp with time zone");

                            b.Property<int>("LocationId")
                                .HasColumnType("integer");

                            b.Property<string>("Name")
                                .IsRequired()
                                .HasColumnType("text");

                            b.Property<int>("Status")
                                .HasColumnType("integer");

                            b.Property<DateTime>("UpdatedAt")
                                .HasColumnType("timestamp with time zone");

                            b.HasKey("Id");

                            b.ToTable("Events");
                        });

                    modelBuilder.Entity("MusicEventManagementSystem.API.Models.Infrastructure", b =>
                        {
                            b.Property<int>("Id")
                                .ValueGeneratedOnAdd()
                                .HasColumnType("integer");

                            NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                            b.Property<int>("ResourceId")
                                .HasColumnType("integer");

                            b.Property<int>("SetupTime")
                                .HasColumnType("integer");

                            b.Property<decimal>("Size")
                                .HasColumnType("numeric");

                            b.Property<decimal>("Weight")
                                .HasColumnType("numeric");

                            b.HasKey("Id");

                            b.ToTable("Infrastructures");
                        });

                    modelBuilder.Entity("MusicEventManagementSystem.API.Models.Location", b =>
                        {
                            b.Property<int>("Id")
                                .ValueGeneratedOnAdd()
                                .HasColumnType("integer");

                            NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));


                            b.Property<string>("Name")
                                .IsRequired()
                                .HasColumnType("text");

                            b.Property<DateTime>("StartDate")
                                .HasColumnType("timestamp with time zone");

                            b.Property<decimal>("TotalBudget")
                                .HasColumnType("numeric");

                            b.HasKey("CampaignId");

                            b.ToTable("Campaigns");
                        });

                    modelBuilder.Entity("MusicEventManagementSystem.API.Models.MediaChannel", b =>
                        {
                            b.Property<int>("MediaChannelId")
                                .ValueGeneratedOnAdd()
                                .HasColumnType("integer");

                            NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("MediaChannelId"));

                            b.Property<string>("APIKey")
                                .HasColumnType("text");

                            b.Property<string>("APIURL")
                                .HasColumnType("text");

                            b.Property<string>("APIVersion")
                                .HasColumnType("text");

                            b.Property<string>("PlatformType")
                                .HasColumnType("text");

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.Performer", b =>
                {
                    b.Property<int>("PerformerId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("PerformerId"));

                    b.Property<TimeSpan>("AverageResponseTime")
                        .HasColumnType("interval");

                    b.Property<string>("Contact")
                        .HasColumnType("text");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Genre")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<decimal>("MaxPrice")
                        .HasColumnType("numeric");

                    b.Property<decimal>("MinPrice")
                        .HasColumnType("numeric");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("Popularity")
                        .HasColumnType("integer");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("TechnicalRequirements")
                        .IsRequired()
                        .HasColumnType("text");

                            b.HasKey("MediaChannelId");


                            b.ToTable("Channels");
                        });

                    b.HasKey("PerformerId");

                    modelBuilder.Entity("MusicEventManagementSystem.API.Models.MediaTask", b =>
                        {
                            b.Property<int>("MediaTaskId")
                                .ValueGeneratedOnAdd()
                                .HasColumnType("integer");

                            NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("MediaTaskId"));

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.Phase", b =>
                {
                    b.Property<int>("PhaseId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("PhaseId"));

                    b.Property<int?>("ContractId")
                        .HasColumnType("integer");

                    b.Property<TimeSpan>("EstimatedDuration")
                        .HasColumnType("interval");

                    b.Property<int>("NegotiationId")
                        .HasColumnType("integer");

                    b.Property<int>("OrderNumber")
                        .HasColumnType("integer");

                    b.Property<string>("PhaseName")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("PhaseId");

                    b.HasIndex("ContractId")
                        .IsUnique();

                    b.HasIndex("NegotiationId");

                    b.ToTable("Phases");
                });

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.PricingRule", b =>
                {
                    b.Property<int>("PricingRuleId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                            b.Property<int?>("MediaWorkflowId")
                                .HasColumnType("integer");

                            b.Property<int>("Order")
                                .HasColumnType("integer");

                            b.Property<string>("TaskName")
                                .HasColumnType("text");

                            b.Property<string>("TaskStatus")
                                .HasColumnType("text");

                            b.Property<int>("WorkflowId")
                                .HasColumnType("integer");

                            b.HasKey("MediaTaskId");

                            b.HasIndex("MediaWorkflowId");

                            b.ToTable("MediaTasks");
                        });

                    modelBuilder.Entity("MusicEventManagementSystem.API.Models.MediaVersion", b =>
                        {
                            b.Property<int>("MediaVersionId")
                                .ValueGeneratedOnAdd()
                                .HasColumnType("integer");

                            NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("MediaVersionId"));

                            b.Property<int>("AdId")
                                .HasColumnType("integer");

                            b.Property<string>("FileType")
                                .HasColumnType("text");

                            b.Property<string>("FileURL")
                                .HasColumnType("text");

                    b.Property<int>("PricingCondition")
                        .HasColumnType("integer");

                    b.HasKey("PricingRuleId");

                            b.Property<bool>("IsFinalVersion")
                                .HasColumnType("boolean");

                            b.Property<string>("VersionFileName")
                                .HasColumnType("text");

                            b.HasKey("MediaVersionId");

                            b.HasIndex("AdId");

                            b.ToTable("MediaVersions");
                        });

                    b.Property<string>("ApplicationUserId")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("PaymentMethod")
                        .HasColumnType("integer");

                    b.Property<DateTime>("SaleDate")
                        .HasColumnType("timestamp with time zone");

                    modelBuilder.Entity("MusicEventManagementSystem.API.Models.MediaWorkflow", b =>
                        {
                            b.Property<int>("MediaWorkflowId")
                                .ValueGeneratedOnAdd()
                                .HasColumnType("integer");


                            NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("MediaWorkflowId"));

                    b.Property<int>("TransactionStatus")
                        .HasColumnType("integer");


                            b.Property<string>("WorkflowDescription")
                                .HasColumnType("text");


                            b.HasKey("MediaWorkflowId");

                            b.ToTable("MediaWorkflows");

                    b.HasIndex("ApplicationUserId");

                    b.ToTable("RecordedSales");
                });

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.Requirement", b =>
                {
                    b.Property<int>("RequirementId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("RequirementId"));

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<bool>("Fulfilled")
                        .HasColumnType("boolean");

                    b.Property<int>("PhaseId")
                        .HasColumnType("integer");

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("RequirementId");

                    b.HasIndex("PhaseId");

                    b.ToTable("Requirements");
                });

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.Resource", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");


                            b.HasKey("Id");

                            b.ToTable("Locations");
                        });

                    modelBuilder.Entity("MusicEventManagementSystem.API.Models.Performance", b =>
                        {
                            b.Property<int>("Id")
                                .ValueGeneratedOnAdd()
                                .HasColumnType("integer");

                            NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                            b.Property<DateTime>("CreatedAt")
                                .HasColumnType("timestamp with time zone");

                            b.Property<DateTime?>("DeletedAt")
                                .HasColumnType("timestamp with time zone");

                            b.Property<DateTime>("EndTime")
                                .HasColumnType("timestamp with time zone");

                            b.Property<int>("EventId")
                                .HasColumnType("integer");

                            b.Property<int>("PerformerId")
                                .HasColumnType("integer");

                            b.Property<int>("SetupTime")
                                .HasColumnType("integer");

                            b.Property<int>("SoundcheckTime")
                                .HasColumnType("integer");

                            b.Property<DateTime>("StartTime")
                                .HasColumnType("timestamp with time zone");

                            b.Property<int>("Status")
                                .HasColumnType("integer");

                            b.Property<DateTime>("UpdatedAt")
                                .HasColumnType("timestamp with time zone");

                            b.Property<int>("VenueId")
                                .HasColumnType("integer");

                            b.HasKey("Id");


                            b.ToTable("Performances");
                        });

                    b.Property<int>("SegmentType")
                        .HasColumnType("integer");

                    b.Property<int>("VenueId")
                        .HasColumnType("integer");

                    modelBuilder.Entity("MusicEventManagementSystem.API.Models.PerformanceResource", b =>
                        {
                            b.Property<int>("Id")
                                .ValueGeneratedOnAdd()
                                .HasColumnType("integer");

                            NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.HasIndex("VenueId");

                    b.ToTable("Segments");
                });

                            b.Property<DateTime>("CreatedAt")
                                .HasColumnType("timestamp with time zone");

                            b.Property<DateTime?>("DeletedAt")
                                .HasColumnType("timestamp with time zone");

                            b.Property<int>("PerformanceId")
                                .HasColumnType("integer");

                            b.Property<int>("QuantityNeeded")
                                .HasColumnType("integer");

                            b.Property<int>("ResourceId")
                                .HasColumnType("integer");

                            b.Property<int>("Status")
                                .HasColumnType("integer");

                            b.Property<DateTime>("UpdatedAt")
                                .HasColumnType("timestamp with time zone");

                            b.HasKey("Id");

                            b.ToTable("PerformanceResources");
                        });

                    modelBuilder.Entity("MusicEventManagementSystem.API.Models.Performer", b =>
                        {
                            b.Property<int>("Id")
                                .ValueGeneratedOnAdd()
                                .HasColumnType("integer");

                            NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                            b.Property<string>("ContactEmail")
                                .IsRequired()
                                .HasColumnType("text");

                            b.Property<string>("ContactPhone")
                                .IsRequired()
                                .HasColumnType("text");

                            b.Property<DateTime>("CreatedAt")
                                .HasColumnType("timestamp with time zone");

                            b.Property<DateTime?>("DeletedAt")
                                .HasColumnType("timestamp with time zone");

                            b.Property<string>("Description")
                                .IsRequired()
                                .HasColumnType("text");

                            b.Property<string>("Genre")
                                .IsRequired()
                                .HasColumnType("text");

                    b.Property<int>("OfferType")
                        .HasColumnType("integer");

                            b.Property<string>("Name")
                                .IsRequired()
                                .HasColumnType("text");

                            b.Property<DateTime>("UpdatedAt")
                                .HasColumnType("timestamp with time zone");

                            b.HasKey("Id");

                            b.ToTable("Performers");

                        });

                    modelBuilder.Entity("MusicEventManagementSystem.API.Models.PricingRule", b =>
                        {
                            b.Property<int>("PricingRuleId")
                                .ValueGeneratedOnAdd()
                                .HasColumnType("integer");

                            NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("PricingRuleId"));

                            b.Property<string>("Description")
                                .HasColumnType("text");

                            b.Property<string>("DynamicCondition")
                                .HasColumnType("text");

                            b.Property<decimal>("EarlyBirdPercentage")
                                .HasColumnType("numeric");

                            b.Property<decimal>("MaximumPrice")
                                .HasColumnType("numeric");

                            b.Property<decimal>("MinimumPrice")
                                .HasColumnType("numeric");

                            b.Property<decimal>("Modifier")
                                .HasColumnType("numeric");

                            b.Property<string>("Name")
                                .HasColumnType("text");

                            b.Property<decimal>("OccupancyPercentage1")
                                .HasColumnType("numeric");

                            b.Property<decimal>("OccupancyPercentage2")
                                .HasColumnType("numeric");

                            b.Property<decimal>("OccupancyThreshold1")
                                .HasColumnType("numeric");

                    b.Property<int?>("RecordedSaleId")
                        .HasColumnType("integer");

                    b.Property<int>("Status")
                        .HasColumnType("integer");

                    b.Property<int>("TicketTypeId")
                        .HasColumnType("integer");

                            b.Property<decimal>("OccupancyThreshold2")
                                .HasColumnType("numeric");

                            b.HasKey("PricingRuleId");

                            b.ToTable("PricingRules");
                        });

                    b.HasIndex("RecordedSaleId");

                    b.HasIndex("TicketTypeId");

                    b.ToTable("Tickets");
                });

                    modelBuilder.Entity("MusicEventManagementSystem.API.Models.RecordedSale", b =>
                        {
                            b.Property<int>("RecordedSaleId")
                                .ValueGeneratedOnAdd()
                                .HasColumnType("integer");

                            NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("RecordedSaleId"));

                            b.Property<string>("PaymentMethod")
                                .HasColumnType("text");

                            b.Property<DateTime>("SaleDate")
                                .HasColumnType("timestamp with time zone");

                            b.Property<decimal>("TotalAmount")
                                .HasColumnType("numeric");

                            b.Property<string>("TransactionStatus")
                                .HasColumnType("text");

                    b.Property<int>("EventId")
                        .HasColumnType("integer");

                    b.Property<string>("Name")
                        .HasColumnType("text");

                    b.Property<int>("Status")
                        .HasColumnType("integer");

                    b.Property<int>("ZoneId")
                        .HasColumnType("integer");

                            b.HasKey("RecordedSaleId");

                            b.ToTable("RecordedSales");
                        });

                    b.HasIndex("EventId");

                    b.HasIndex("ZoneId");

                    b.ToTable("TicketTypes");
                });

                    modelBuilder.Entity("MusicEventManagementSystem.API.Models.Resource", b =>
                        {
                            b.Property<int>("Id")
                                .ValueGeneratedOnAdd()
                                .HasColumnType("integer");

                            NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                            b.Property<DateTime>("CreatedAt")
                                .HasColumnType("timestamp with time zone");

                            b.Property<DateTime?>("DeletedAt")
                                .HasColumnType("timestamp with time zone");

                            b.Property<string>("Description")
                                .IsRequired()
                                .HasColumnType("text");

                            b.Property<bool>("IsAvailable")
                                .HasColumnType("boolean");

                            b.Property<string>("Name")
                                .IsRequired()
                                .HasColumnType("text");

                            b.Property<int>("Quantity")
                                .HasColumnType("integer");

                            b.Property<int>("Type")
                                .HasColumnType("integer");

                            b.Property<DateTime>("UpdatedAt")
                                .HasColumnType("timestamp with time zone");

                            b.HasKey("Id");

                            b.ToTable("Resources");
                        });

                    modelBuilder.Entity("MusicEventManagementSystem.API.Models.Segment", b =>
                        {
                            b.Property<int>("SegmentId")
                                .ValueGeneratedOnAdd()
                                .HasColumnType("integer");

                            NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("SegmentId"));

                            b.Property<int>("Capacity")
                                .HasColumnType("integer");

                            b.Property<string>("Description")
                                .HasColumnType("text");

                            b.Property<string>("Name")
                                .HasColumnType("text");

                            b.Property<string>("SegmentType")
                                .HasColumnType("text");

                    b.Property<int>("VenueType")
                        .HasColumnType("integer");

                            b.HasKey("SegmentId");

                            b.ToTable("Segments");
                        });

                    modelBuilder.Entity("MusicEventManagementSystem.API.Models.Service", b =>
                        {
                            b.Property<int>("Id")
                                .ValueGeneratedOnAdd()
                                .HasColumnType("integer");

                            NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                            b.Property<string>("Contact")
                                .IsRequired()
                                .HasColumnType("text");

                            b.Property<int>("ContractSigned")
                                .HasColumnType("integer");

                            b.Property<string>("Provider")
                                .IsRequired()
                                .HasColumnType("text");

                            b.Property<int>("ResourceId")
                                .HasColumnType("integer");

                            b.Property<int>("ServiceDuration")
                                .HasColumnType("integer");

                            b.HasKey("Id");

                            b.ToTable("Services");
                        });

                    modelBuilder.Entity("MusicEventManagementSystem.API.Models.SpecialOffer", b =>
                        {
                            b.Property<int>("SpecialOfferId")
                                .ValueGeneratedOnAdd()
                                .HasColumnType("integer");

                            NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("SpecialOfferId"));

                            b.Property<string>("ApplicationCondition")
                                .HasColumnType("text");

                            b.Property<string>("Description")
                                .HasColumnType("text");

                            b.Property<decimal>("DiscountValue")
                                .HasColumnType("numeric");

                            b.Property<DateTime>("EndDate")
                                .HasColumnType("timestamp with time zone");

                            b.Property<string>("Name")
                                .HasColumnType("text");

                            b.Property<string>("OfferType")
                                .HasColumnType("text");

                            b.Property<DateTime>("StartDate")
                                .HasColumnType("timestamp with time zone");

                            b.Property<int>("TicketLimit")
                                .HasColumnType("integer");

                            b.HasKey("SpecialOfferId");

                    b.Property<int>("Position")
                        .HasColumnType("integer");

                    b.Property<int>("SegmentId")
                        .HasColumnType("integer");

                            b.ToTable("SpecialOffers");
                        });

                    modelBuilder.Entity("MusicEventManagementSystem.API.Models.Staff", b =>
                        {
                            b.Property<int>("Id")
                                .ValueGeneratedOnAdd()
                                .HasColumnType("integer");

                    b.HasIndex("SegmentId");

                    b.ToTable("Zones");
                });

                            NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                            b.Property<int>("RequiredSkillLevel")
                                .HasColumnType("integer");

                            b.Property<int>("ResourceId")
                                .HasColumnType("integer");

                            b.Property<int>("Role")
                                .HasColumnType("integer");

                            b.HasKey("Id");

                            b.ToTable("Staff");
                        });

                    modelBuilder.Entity("MusicEventManagementSystem.API.Models.Ticket", b =>
                        {
                            b.Property<int>("TicketId")
                                .ValueGeneratedOnAdd()
                                .HasColumnType("integer");

                            NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("TicketId"));

                            b.Property<decimal>("FinalPrice")
                                .HasColumnType("numeric");

                            b.Property<DateTime>("IssueDate")
                                .HasColumnType("timestamp with time zone");

                            b.Property<string>("QrCode")
                                .HasColumnType("text");

                            b.Property<string>("Status")
                                .HasColumnType("text");

                            b.Property<string>("UniqueCode")
                                .HasColumnType("text");

                            b.HasKey("TicketId");

                            b.ToTable("Tickets");
                        });

                    modelBuilder.Entity("MusicEventManagementSystem.API.Models.TicketType", b =>
                        {
                            b.Property<int>("TicketTypeId")
                                .ValueGeneratedOnAdd()
                                .HasColumnType("integer");

                            NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("TicketTypeId"));

                            b.Property<int>("AvailableQuantity")
                                .HasColumnType("integer");

                            b.Property<string>("Description")
                                .HasColumnType("text");

                            b.Property<string>("Name")
                                .HasColumnType("text");

                            b.Property<string>("Status")
                                .HasColumnType("text");

                            b.HasKey("TicketTypeId");

                            b.ToTable("TicketTypes");
                        });

                    modelBuilder.Entity("MusicEventManagementSystem.API.Models.Vehicle", b =>
                        {
                            b.Property<int>("Id")
                                .ValueGeneratedOnAdd()
                                .HasColumnType("integer");

                            NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

            modelBuilder.Entity("PricingRuleTicketType", b =>
                {
                    b.Property<int>("PricingRulesPricingRuleId")
                        .HasColumnType("integer");

                    b.Property<int>("TicketTypesTicketTypeId")
                        .HasColumnType("integer");

                    b.HasKey("PricingRulesPricingRuleId", "TicketTypesTicketTypeId");

                    b.HasIndex("TicketTypesTicketTypeId");

                    b.ToTable("TicketTypePricingRules", (string)null);
                });

            modelBuilder.Entity("RecordedSaleSpecialOffer", b =>
                {
                    b.Property<int>("RecordedSalesRecordedSaleId")
                        .HasColumnType("integer");

                    b.Property<int>("SpecialOffersSpecialOfferId")
                        .HasColumnType("integer");

                    b.HasKey("RecordedSalesRecordedSaleId", "SpecialOffersSpecialOfferId");

                    b.HasIndex("SpecialOffersSpecialOfferId");

                    b.ToTable("RecordedSaleSpecialOffers", (string)null);
                });

            modelBuilder.Entity("SpecialOfferTicketType", b =>
                {
                    b.Property<int>("SpecialOffersSpecialOfferId")
                        .HasColumnType("integer");

                    b.Property<int>("TicketTypesTicketTypeId")
                        .HasColumnType("integer");

                    b.HasKey("SpecialOffersSpecialOfferId", "TicketTypesTicketTypeId");

                    b.HasIndex("TicketTypesTicketTypeId");

                    b.ToTable("TicketTypeSpecialOffers", (string)null);
                });

            modelBuilder.Entity("EventPricingRule", b =>
                {
                    b.HasOne("MusicEventManagementSystem.API.Models.Event", null)
                        .WithMany()
                        .HasForeignKey("EventsId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("MusicEventManagementSystem.API.Models.PricingRule", null)
                        .WithMany()
                        .HasForeignKey("PricingRulesPricingRuleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityRole", null)
                        .WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

                            b.Property<int>("Capacity")
                                .HasColumnType("integer");

                            b.Property<bool>("DriverRequired")
                                .HasColumnType("boolean");

                            b.Property<int>("FuelType")
                                .HasColumnType("integer");

                            b.Property<string>("LicensePlate")
                                .IsRequired()
                                .HasColumnType("text");

                            b.Property<int>("ResourceId")
                                .HasColumnType("integer");

                            b.Property<int>("VehicleType")
                                .HasColumnType("integer");

                            b.HasKey("Id");

                            b.ToTable("Vehicles");
                        });

                    modelBuilder.Entity("MusicEventManagementSystem.API.Models.Venue", b =>
                        {
                            b.Property<int>("VenueId")
                                .ValueGeneratedOnAdd()
                                .HasColumnType("integer");

                            NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("VenueId"));

                            b.Property<string>("Address")
                                .HasColumnType("text");

                            b.Property<int>("Capacity")
                                .HasColumnType("integer");

                            b.Property<string>("City")
                                .HasColumnType("text");

                            b.Property<string>("Description")
                                .HasColumnType("text");

                            b.Property<string>("Name")
                                .HasColumnType("text");

                            b.Property<string>("VenueType")
                                .HasColumnType("text");

                            b.HasKey("VenueId");

                            b.ToTable("Venues");
                        });

                    modelBuilder.Entity("MusicEventManagementSystem.API.Models.WorkTask", b =>
                        {
                            b.Property<int>("Id")
                                .ValueGeneratedOnAdd()
                                .HasColumnType("integer");

                            NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                            b.Property<DateTime>("CreatedAt")
                                .HasColumnType("timestamp with time zone");

                            b.Property<DateTime?>("DeletedAt")
                                .HasColumnType("timestamp with time zone");

                            b.Property<string>("Description")
                                .IsRequired()
                                .HasColumnType("text");

                            b.Property<DateTime>("End")
                                .HasColumnType("timestamp with time zone");

                            b.Property<string>("Name")
                                .IsRequired()
                                .HasColumnType("text");

                            b.Property<int>("PerformanceId")
                                .HasColumnType("integer");

                            b.Property<DateTime>("Start")
                                .HasColumnType("timestamp with time zone");

                            b.Property<int>("Status")
                                .HasColumnType("integer");

                            b.Property<DateTime>("UpdatedAt")
                                .HasColumnType("timestamp with time zone");

                            b.HasKey("Id");

                            b.ToTable("WorkTasks");
                        });

                    modelBuilder.Entity("MusicEventManagementSystem.API.Models.Zone", b =>
                        {
                            b.Property<int>("ZoneId")
                                .ValueGeneratedOnAdd()
                                .HasColumnType("integer");

                            NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("ZoneId"));

                            b.Property<decimal>("BasePrice")
                                .HasColumnType("numeric");

                            b.Property<int>("Capacity")
                                .HasColumnType("integer");

                            b.Property<string>("Description")
                                .HasColumnType("text");

                            b.Property<string>("Name")
                                .HasColumnType("text");

                            b.Property<string>("Position")
                                .HasColumnType("text");

                            b.HasKey("ZoneId");

                            b.ToTable("Zones");
                        });

                    modelBuilder.Entity("MusicEventManagementSystem.Models.Auth.ApplicationUser", b =>
                        {
                            b.Property<string>("Id")
                                .HasColumnType("text");

                            b.Property<int>("AccessFailedCount")
                                .HasColumnType("integer");

                            b.Property<string>("ConcurrencyStamp")
                                .IsConcurrencyToken()
                                .HasColumnType("text");

                            b.Property<DateTime>("CreatedAt")
                                .HasColumnType("timestamp with time zone");

                            b.Property<int>("Department")
                                .HasColumnType("integer");

                            b.Property<string>("Email")
                                .HasMaxLength(256)
                                .HasColumnType("character varying(256)");

                            b.Property<bool>("EmailConfirmed")
                                .HasColumnType("boolean");

                            b.Property<string>("FirstName")
                                .IsRequired()
                                .HasColumnType("text");

                            b.Property<bool>("IsActive")
                                .HasColumnType("boolean");

                            b.Property<string>("LastName")
                                .IsRequired()
                                .HasColumnType("text");

                            b.Property<bool>("LockoutEnabled")
                                .HasColumnType("boolean");

                            b.Property<DateTimeOffset?>("LockoutEnd")
                                .HasColumnType("timestamp with time zone");

                            b.Property<string>("NormalizedEmail")
                                .HasMaxLength(256)
                                .HasColumnType("character varying(256)");

                            b.Property<string>("NormalizedUserName")
                                .HasMaxLength(256)
                                .HasColumnType("character varying(256)");

                            b.Property<string>("PasswordHash")
                                .HasColumnType("text");

                            b.Property<string>("PhoneNumber")
                                .HasColumnType("text");

                            b.Property<bool>("PhoneNumberConfirmed")
                                .HasColumnType("boolean");

                            b.Property<string>("SecurityStamp")
                                .HasColumnType("text");

                            b.Property<bool>("TwoFactorEnabled")
                                .HasColumnType("boolean");

                            b.Property<string>("UserName")
                                .HasMaxLength(256)
                                .HasColumnType("character varying(256)");

                            b.HasKey("Id");

                            b.HasIndex("NormalizedEmail")
                                .HasDatabaseName("EmailIndex");

                            b.HasIndex("NormalizedUserName")
                                .IsUnique()
                                .HasDatabaseName("UserNameIndex");

                            b.ToTable("AspNetUsers", (string)null);
                        });

                    modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>", b =>
                        {
                            b.HasOne("Microsoft.AspNetCore.Identity.IdentityRole", null)
                                .WithMany()
                                .HasForeignKey("RoleId")
                                .OnDelete(DeleteBehavior.Cascade)
                                .IsRequired();
                        });

                    modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserClaim<string>", b =>
                        {
                            b.HasOne("MusicEventManagementSystem.Models.Auth.ApplicationUser", null)
                                .WithMany()
                                .HasForeignKey("UserId")
                                .OnDelete(DeleteBehavior.Cascade)
                                .IsRequired();
                        });

                    modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserLogin<string>", b =>
                        {
                            b.HasOne("MusicEventManagementSystem.Models.Auth.ApplicationUser", null)
                                .WithMany()
                                .HasForeignKey("UserId")
                                .OnDelete(DeleteBehavior.Cascade)
                                .IsRequired();
                        });

                    modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserRole<string>", b =>
                        {
                            b.HasOne("Microsoft.AspNetCore.Identity.IdentityRole", null)
                                .WithMany()
                                .HasForeignKey("RoleId")
                                .OnDelete(DeleteBehavior.Cascade)
                                .IsRequired();

                            b.HasOne("MusicEventManagementSystem.Models.Auth.ApplicationUser", null)
                                .WithMany()
                                .HasForeignKey("UserId")
                                .OnDelete(DeleteBehavior.Cascade)
                                .IsRequired();
                        });

                    modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserToken<string>", b =>
                        {
                            b.HasOne("MusicEventManagementSystem.Models.Auth.ApplicationUser", null)
                                .WithMany()
                                .HasForeignKey("UserId")
                                .OnDelete(DeleteBehavior.Cascade)
                                .IsRequired();
                        });

                    modelBuilder.Entity("MusicEventManagementSystem.API.Models.MediaTask", b =>
                        {
                            b.HasOne("MusicEventManagementSystem.API.Models.MediaWorkflow", null)
                                .WithMany("Tasks")
                                .HasForeignKey("MediaWorkflowId");
                        });

                    modelBuilder.Entity("MusicEventManagementSystem.API.Models.MediaVersion", b =>
                        {
                            b.HasOne("MusicEventManagementSystem.API.Models.Ad", "Ad")
                                .WithMany()
                                .HasForeignKey("AdId")
                                .OnDelete(DeleteBehavior.Cascade)
                                .IsRequired();

                            b.Navigation("Ad");
                        });

                    modelBuilder.Entity("MusicEventManagementSystem.API.Models.MediaWorkflow", b =>
                        {
                            b.Navigation("Tasks");
                        });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserToken<string>", b =>
                {
                    b.HasOne("MusicEventManagementSystem.Models.Auth.ApplicationUser", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.Communication", b =>
                {
                    b.HasOne("MusicEventManagementSystem.API.Models.Negotiation", "Negotiation")
                        .WithOne("Communication")
                        .HasForeignKey("MusicEventManagementSystem.API.Models.Communication", "NegotiationId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Negotiation");
                });

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.Contract", b =>
                {
                    b.HasOne("MusicEventManagementSystem.API.Models.Performer", "Performer")
                        .WithMany("Contracts")
                        .HasForeignKey("PerformerId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Performer");
                });

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.Document", b =>
                {
                    b.HasOne("MusicEventManagementSystem.API.Models.Negotiation", "Negotiation")
                        .WithMany("Documents")
                        .HasForeignKey("NegotiationId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Negotiation");
                });

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.Negotiation", b =>
                {
                    b.HasOne("MusicEventManagementSystem.API.Models.Event", "Event")
                        .WithOne("Negotiation")
                        .HasForeignKey("MusicEventManagementSystem.API.Models.Negotiation", "EventId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("MusicEventManagementSystem.API.Models.Performer", "Performer")
                        .WithOne("Negotiation")
                        .HasForeignKey("MusicEventManagementSystem.API.Models.Negotiation", "PerformerId")
                        .OnDelete(DeleteBehavior.Restrict);
                });

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.RecordedSale", b =>
                {
                    b.HasOne("MusicEventManagementSystem.Models.Auth.ApplicationUser", "ApplicationUser")
                        .WithMany()
                        .HasForeignKey("ApplicationUserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("ApplicationUser");
                });

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.Segment", b =>
                {
                    b.HasOne("MusicEventManagementSystem.API.Models.Venue", "Venue")
                        .WithMany("Segments")
                        .HasForeignKey("VenueId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Venue");
                });

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.Ticket", b =>
                {
                    b.HasOne("MusicEventManagementSystem.API.Models.RecordedSale", "RecordedSale")
                        .WithMany("Tickets")
                        .HasForeignKey("RecordedSaleId");

                    b.HasOne("MusicEventManagementSystem.API.Models.TicketType", "TicketType")
                        .WithMany("Tickets")
                        .HasForeignKey("TicketTypeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("RecordedSale");

                    b.Navigation("TicketType");
                });

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.TicketType", b =>
                {
                    b.HasOne("MusicEventManagementSystem.API.Models.Event", "Event")
                        .WithMany("TicketTypes")
                        .HasForeignKey("EventId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("MusicEventManagementSystem.API.Models.Zone", "Zone")
                        .WithMany("TicketTypes")
                        .HasForeignKey("ZoneId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Event");

                    b.Navigation("Performer");
                });

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.NegotiationUser", b =>
                {
                    b.HasOne("MusicEventManagementSystem.API.Models.Negotiation", "Negotiation")
                        .WithMany("Users")
                        .HasForeignKey("NegotiationId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("MusicEventManagementSystem.Models.Auth.ApplicationUser", "User")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Negotiation");

                    b.Navigation("User");
                });

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.Phase", b =>
                {
                    b.HasOne("MusicEventManagementSystem.API.Models.Contract", "Contract")
                        .WithOne("Phase")
                        .HasForeignKey("MusicEventManagementSystem.API.Models.Phase", "ContractId")
                        .OnDelete(DeleteBehavior.SetNull);

                    b.HasOne("MusicEventManagementSystem.API.Models.Negotiation", "Negotiation")
                        .WithMany("Phases")
                        .HasForeignKey("NegotiationId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Contract");

                    b.Navigation("Negotiation");
                });

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.Requirement", b =>
                {
                    b.HasOne("MusicEventManagementSystem.API.Models.Phase", "Phase")
                        .WithMany("Requirements")
                        .HasForeignKey("PhaseId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Phase");
                });

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.Contract", b =>
                {
                    b.Navigation("Phase");
                });

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.Event", b =>
                {
                    b.Navigation("Negotiation");
                });

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.Negotiation", b =>
                {
                    b.Navigation("Communication")
                        .IsRequired();

                    b.Navigation("Documents");

                    b.Navigation("Phases");

                    b.Navigation("Users");
                });

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.Performer", b =>
                {
                    b.Navigation("Contracts");

                    b.Navigation("Negotiation");
                });

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.Phase", b =>
                {
                    b.Navigation("Requirements");

                    b.Navigation("Zone");
                });

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.Zone", b =>
                {
                    b.HasOne("MusicEventManagementSystem.API.Models.Segment", "Segment")
                        .WithMany("Zones")
                        .HasForeignKey("SegmentId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Segment");
                });

            modelBuilder.Entity("PricingRuleTicketType", b =>
                {
                    b.HasOne("MusicEventManagementSystem.API.Models.PricingRule", null)
                        .WithMany()
                        .HasForeignKey("PricingRulesPricingRuleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("MusicEventManagementSystem.API.Models.TicketType", null)
                        .WithMany()
                        .HasForeignKey("TicketTypesTicketTypeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("RecordedSaleSpecialOffer", b =>
                {
                    b.HasOne("MusicEventManagementSystem.API.Models.RecordedSale", null)
                        .WithMany()
                        .HasForeignKey("RecordedSalesRecordedSaleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("MusicEventManagementSystem.API.Models.SpecialOffer", null)
                        .WithMany()
                        .HasForeignKey("SpecialOffersSpecialOfferId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("SpecialOfferTicketType", b =>
                {
                    b.HasOne("MusicEventManagementSystem.API.Models.SpecialOffer", null)
                        .WithMany()
                        .HasForeignKey("SpecialOffersSpecialOfferId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("MusicEventManagementSystem.API.Models.TicketType", null)
                        .WithMany()
                        .HasForeignKey("TicketTypesTicketTypeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.Event", b =>
                {
                    b.Navigation("TicketTypes");
                });

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.RecordedSale", b =>
                {
                    b.Navigation("Tickets");
                });

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.Segment", b =>
                {
                    b.Navigation("Zones");
                });

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.TicketType", b =>
                {
                    b.Navigation("Tickets");
                });

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.Venue", b =>
                {
                    b.Navigation("Segments");
                });

            modelBuilder.Entity("MusicEventManagementSystem.API.Models.Zone", b =>
                {
                    b.Navigation("TicketTypes");
                });
#pragma warning restore 612, 618
                });
        }
    }
}
