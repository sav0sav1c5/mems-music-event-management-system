using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable
#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace MusicEventManagementSystem.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePhaseSystemModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Step 1: Drop existing foreign key constraints and columns that conflict with new model
            migrationBuilder.DropForeignKey(
                name: "FK_Phases_Negotiations_NegotiationId",
                table: "Phases");

            migrationBuilder.DropForeignKey(
                name: "FK_Phases_Contracts_ContractId",
                table: "Phases");

            migrationBuilder.DropColumn(
                name: "NegotiationId",
                table: "Phases");

            migrationBuilder.DropColumn(
                name: "ContractId",
                table: "Phases");

            migrationBuilder.DropColumn(
                name: "Fulfilled",
                table: "Requirements");

            // Step 2: Add new columns to existing tables
            migrationBuilder.AddColumn<int>(
                name: "CurrentPhaseOrder",
                table: "Negotiations",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<bool>(
                name: "IsRequired",
                table: "Requirements",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Requirements",
                type: "timestamp with time zone",
                nullable: true);

            // Add missing columns to Phases table
            migrationBuilder.AddColumn<bool>(
                name: "IsGlobal",
                table: "Phases",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Phases",
                type: "text",
                nullable: true);

            // Change EstimatedDuration from interval to integer (days) using raw SQL
            migrationBuilder.Sql("ALTER TABLE \"Phases\" ALTER COLUMN \"EstimatedDuration\" TYPE integer USING EXTRACT(DAY FROM \"EstimatedDuration\");");

            // Step 3: Create NegotiationPhases junction table
            migrationBuilder.CreateTable(
                name: "NegotiationPhases",
                columns: table => new
                {
                    NegotiationId = table.Column<int>(type: "integer", nullable: false),
                    PhaseId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NegotiationPhases", x => new { x.NegotiationId, x.PhaseId });
                    table.ForeignKey(
                        name: "FK_NegotiationPhases_Negotiations_NegotiationId",
                        column: x => x.NegotiationId,
                        principalTable: "Negotiations",
                        principalColumn: "NegotiationId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NegotiationPhases_Phases_PhaseId",
                        column: x => x.PhaseId,
                        principalTable: "Phases",
                        principalColumn: "PhaseId",
                        onDelete: ReferentialAction.Cascade);
                });

            // Step 4: Create NegotiationRequirementFulfillments table
            migrationBuilder.CreateTable(
                name: "NegotiationRequirementFulfillments",
                columns: table => new
                {
                    FulfillmentId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    NegotiationId = table.Column<int>(type: "integer", nullable: false),
                    PhaseId = table.Column<int>(type: "integer", nullable: false),
                    RequirementId = table.Column<int>(type: "integer", nullable: false),
                    IsFulfilled = table.Column<bool>(type: "boolean", nullable: false),
                    Evidence = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    FulfilledDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FulfilledBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NegotiationRequirementFulfillments", x => x.FulfillmentId);
                    table.ForeignKey(
                        name: "FK_NegotiationRequirementFulfillments_NegotiationPhases_Negoti~",
                        columns: x => new { x.NegotiationId, x.PhaseId },
                        principalTable: "NegotiationPhases",
                        principalColumns: new[] { "NegotiationId", "PhaseId" },
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NegotiationRequirementFulfillments_Negotiations_Negotiation~",
                        column: x => x.NegotiationId,
                        principalTable: "Negotiations",
                        principalColumn: "NegotiationId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NegotiationRequirementFulfillments_Phases_PhaseId",
                        column: x => x.PhaseId,
                        principalTable: "Phases",
                        principalColumn: "PhaseId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_NegotiationRequirementFulfillments_Requirements_Requirement~",
                        column: x => x.RequirementId,
                        principalTable: "Requirements",
                        principalColumn: "RequirementId",
                        onDelete: ReferentialAction.Cascade);
                });

            // Step 5: Create indexes for the new tables
            migrationBuilder.CreateIndex(
                name: "IX_NegotiationPhases_PhaseId",
                table: "NegotiationPhases",
                column: "PhaseId");

            migrationBuilder.CreateIndex(
                name: "IX_NegotiationRequirementFulfillments_NegotiationId_PhaseId",
                table: "NegotiationRequirementFulfillments",
                columns: new[] { "NegotiationId", "PhaseId" });

            migrationBuilder.CreateIndex(
                name: "IX_NegotiationRequirementFulfillments_PhaseId",
                table: "NegotiationRequirementFulfillments",
                column: "PhaseId");

            migrationBuilder.CreateIndex(
                name: "IX_NegotiationRequirementFulfillments_RequirementId",
                table: "NegotiationRequirementFulfillments",
                column: "RequirementId");

            // Step 6: Clear existing data and insert seed data for global phases
            migrationBuilder.Sql("DELETE FROM \"Requirements\" WHERE \"PhaseId\" IS NOT NULL;");
            migrationBuilder.Sql("DELETE FROM \"Phases\";");

            // Insert global phases using raw SQL
            migrationBuilder.Sql(@"
                INSERT INTO ""Phases"" (""PhaseId"", ""EstimatedDuration"", ""OrderNumber"", ""PhaseName"", ""IsGlobal"") VALUES 
                (1, 7, 1, 'Initial Outreach', true),
                (2, 14, 2, 'Preliminary Negotiations', true),
                (3, 21, 3, 'Contract Negotiations', true),
                (4, 10, 4, 'Contract Draft', true),
                (5, 5, 5, 'Final Agreement', true);
            ");

            // Insert requirements for each phase using raw SQL
            migrationBuilder.Sql(@"
                INSERT INTO ""Requirements"" (""RequirementId"", ""CreatedAt"", ""Description"", ""IsRequired"", ""PhaseId"", ""Title"", ""UpdatedAt"") VALUES 
                (1, '2025-09-26 12:00:00+00', 'Initial contact with performer representatives', true, 1, 'Contact Performer', '2025-09-26 12:00:00+00'),
                (2, '2025-09-26 12:00:00+00', 'Confirm performer availability for event dates', true, 1, 'Verify Availability', '2025-09-26 12:00:00+00'),
                (3, '2025-09-26 12:00:00+00', 'Share comprehensive event information', true, 1, 'Provide Event Details', '2025-09-26 12:00:00+00'),
                (4, '2025-09-26 12:00:00+00', 'Initial fee and compensation discussions', true, 2, 'Fee Discussion', '2025-09-26 12:00:00+00'),
                (5, '2025-09-26 12:00:00+00', 'Discuss technical and venue requirements', true, 2, 'Technical Requirements', '2025-09-26 12:00:00+00'),
                (6, '2025-09-26 12:00:00+00', 'Coordinate scheduling and logistics', true, 2, 'Schedule Coordination', '2025-09-26 12:00:00+00'),
                (7, '2025-09-26 12:00:00+00', 'Negotiate detailed contract terms', true, 3, 'Contract Terms', '2025-09-26 12:00:00+00'),
                (8, '2025-09-26 12:00:00+00', 'Legal team review of contract terms', true, 3, 'Legal Review', '2025-09-26 12:00:00+00'),
                (9, '2025-09-26 12:00:00+00', 'Negotiate technical and hospitality riders', true, 3, 'Rider Negotiations', '2025-09-26 12:00:00+00'),
                (10, '2025-09-26 12:00:00+00', 'Prepare final contract draft', true, 4, 'Draft Preparation', '2025-09-26 12:00:00+00'),
                (11, '2025-09-26 12:00:00+00', 'All stakeholders review draft', true, 4, 'Stakeholder Review', '2025-09-26 12:00:00+00'),
                (12, '2025-09-26 12:00:00+00', 'Incorporate any necessary revisions', false, 4, 'Revisions', '2025-09-26 12:00:00+00'),
                (13, '2025-09-26 12:00:00+00', 'All parties sign the final contract', true, 5, 'Contract Signing', '2025-09-26 12:00:00+00'),
                (14, '2025-09-26 12:00:00+00', 'Establish payment schedule and methods', true, 5, 'Payment Schedule Setup', '2025-09-26 12:00:00+00'),
                (15, '2025-09-26 12:00:00+00', 'File and distribute final documentation', true, 5, 'Documentation Filing', '2025-09-26 12:00:00+00');
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop new tables
            migrationBuilder.DropTable(
                name: "NegotiationRequirementFulfillments");

            migrationBuilder.DropTable(
                name: "NegotiationPhases");

            // Remove new columns
            migrationBuilder.DropColumn(
                name: "CurrentPhaseOrder",
                table: "Negotiations");

            migrationBuilder.DropColumn(
                name: "IsRequired",
                table: "Requirements");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Requirements");

            // Restore old column
            migrationBuilder.AddColumn<bool>(
                name: "Fulfilled",
                table: "Requirements",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            // Clear seed data
            migrationBuilder.Sql("DELETE FROM \"Requirements\";");
            migrationBuilder.Sql("DELETE FROM \"Phases\";");
        }
    }
}