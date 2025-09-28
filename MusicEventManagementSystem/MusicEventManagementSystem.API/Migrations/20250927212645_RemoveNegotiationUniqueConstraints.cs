using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace MusicEventManagementSystem.Migrations
{
    /// <inheritdoc />
    public partial class RemoveNegotiationUniqueConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_NegotiationRequirementFulfillments_Phases_PhaseId",
                table: "NegotiationRequirementFulfillments");

            migrationBuilder.DropIndex(
                name: "IX_Negotiations_EventId",
                table: "Negotiations");

            migrationBuilder.DropIndex(
                name: "IX_Negotiations_PerformerId",
                table: "Negotiations");

            migrationBuilder.AlterColumn<int>(
                name: "Position",
                table: "Zones",
                type: "integer",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "VenueType",
                table: "Venues",
                type: "integer",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "TicketTypes",
                type: "integer",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "Tickets",
                type: "integer",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "OfferType",
                table: "SpecialOffers",
                type: "integer",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "SegmentType",
                table: "Segments",
                type: "integer",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Requirements",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<int>(
                name: "TransactionStatus",
                table: "RecordedSales",
                type: "integer",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "PaymentMethod",
                table: "RecordedSales",
                type: "integer",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PricingCondition",
                table: "PricingRules",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "EstimatedDuration",
                table: "Phases",
                type: "integer",
                nullable: false,
                oldClrType: typeof(TimeSpan),
                oldType: "interval");

            migrationBuilder.AddColumn<int>(
                name: "EventId1",
                table: "Negotiations",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PerformerId1",
                table: "Negotiations",
                type: "integer",
                nullable: true);

            migrationBuilder.InsertData(
                table: "Phases",
                columns: new[] { "PhaseId", "Description", "EstimatedDuration", "IsGlobal", "OrderNumber", "PhaseName" },
                values: new object[,]
                {
                    { 1, null, 7, true, 1, "Initial Outreach" },
                    { 2, null, 14, true, 2, "Preliminary Negotiations" },
                    { 3, null, 21, true, 3, "Contract Negotiations" },
                    { 4, null, 10, true, 4, "Contract Draft" },
                    { 5, null, 5, true, 5, "Final Agreement" }
                });

            migrationBuilder.InsertData(
                table: "Requirements",
                columns: new[] { "RequirementId", "CreatedAt", "Description", "IsRequired", "PhaseId", "Title", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944), "Initial contact with performer representatives", true, 1, "Contact Performer", new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944) },
                    { 2, new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944), "Confirm performer availability for event dates", true, 1, "Verify Availability", new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944) },
                    { 3, new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944), "Share comprehensive event information", true, 1, "Provide Event Details", new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944) },
                    { 4, new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944), "Initial fee and compensation discussions", true, 2, "Fee Discussion", new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944) },
                    { 5, new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944), "Discuss technical and venue requirements", true, 2, "Technical Requirements", new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944) },
                    { 6, new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944), "Coordinate scheduling and logistics", true, 2, "Schedule Coordination", new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944) },
                    { 7, new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944), "Negotiate detailed contract terms", true, 3, "Contract Terms", new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944) },
                    { 8, new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944), "Legal team review of contract terms", true, 3, "Legal Review", new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944) },
                    { 9, new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944), "Negotiate technical and hospitality riders", true, 3, "Rider Negotiations", new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944) },
                    { 10, new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944), "Prepare final contract draft", true, 4, "Draft Preparation", new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944) },
                    { 11, new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944), "All stakeholders review draft", true, 4, "Stakeholder Review", new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944) },
                    { 12, new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944), "Incorporate any necessary revisions", false, 4, "Revisions", new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944) },
                    { 13, new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944), "All parties sign the final contract", true, 5, "Contract Signing", new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944) },
                    { 14, new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944), "Establish payment schedule and methods", true, 5, "Payment Schedule Setup", new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944) },
                    { 15, new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944), "File and distribute final documentation", true, 5, "Documentation Filing", new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944) }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Negotiations_EventId",
                table: "Negotiations",
                column: "EventId");

            migrationBuilder.CreateIndex(
                name: "IX_Negotiations_EventId1",
                table: "Negotiations",
                column: "EventId1",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Negotiations_PerformerId",
                table: "Negotiations",
                column: "PerformerId");

            migrationBuilder.CreateIndex(
                name: "IX_Negotiations_PerformerId1",
                table: "Negotiations",
                column: "PerformerId1",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_NegotiationRequirementFulfillments_Negotiations_Negotiation~",
                table: "NegotiationRequirementFulfillments",
                column: "NegotiationId",
                principalTable: "Negotiations",
                principalColumn: "NegotiationId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_NegotiationRequirementFulfillments_Phases_PhaseId",
                table: "NegotiationRequirementFulfillments",
                column: "PhaseId",
                principalTable: "Phases",
                principalColumn: "PhaseId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Negotiations_Events_EventId1",
                table: "Negotiations",
                column: "EventId1",
                principalTable: "Events",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Negotiations_Performers_PerformerId1",
                table: "Negotiations",
                column: "PerformerId1",
                principalTable: "Performers",
                principalColumn: "PerformerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_NegotiationRequirementFulfillments_Negotiations_Negotiation~",
                table: "NegotiationRequirementFulfillments");

            migrationBuilder.DropForeignKey(
                name: "FK_NegotiationRequirementFulfillments_Phases_PhaseId",
                table: "NegotiationRequirementFulfillments");

            migrationBuilder.DropForeignKey(
                name: "FK_Negotiations_Events_EventId1",
                table: "Negotiations");

            migrationBuilder.DropForeignKey(
                name: "FK_Negotiations_Performers_PerformerId1",
                table: "Negotiations");

            migrationBuilder.DropIndex(
                name: "IX_Negotiations_EventId",
                table: "Negotiations");

            migrationBuilder.DropIndex(
                name: "IX_Negotiations_EventId1",
                table: "Negotiations");

            migrationBuilder.DropIndex(
                name: "IX_Negotiations_PerformerId",
                table: "Negotiations");

            migrationBuilder.DropIndex(
                name: "IX_Negotiations_PerformerId1",
                table: "Negotiations");

            migrationBuilder.DeleteData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 15);

            migrationBuilder.DeleteData(
                table: "Phases",
                keyColumn: "PhaseId",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Phases",
                keyColumn: "PhaseId",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Phases",
                keyColumn: "PhaseId",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Phases",
                keyColumn: "PhaseId",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Phases",
                keyColumn: "PhaseId",
                keyValue: 5);

            migrationBuilder.DropColumn(
                name: "PricingCondition",
                table: "PricingRules");

            migrationBuilder.DropColumn(
                name: "EventId1",
                table: "Negotiations");

            migrationBuilder.DropColumn(
                name: "PerformerId1",
                table: "Negotiations");

            migrationBuilder.AlterColumn<string>(
                name: "Position",
                table: "Zones",
                type: "text",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "VenueType",
                table: "Venues",
                type: "text",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "TicketTypes",
                type: "text",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Tickets",
                type: "text",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "OfferType",
                table: "SpecialOffers",
                type: "text",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "SegmentType",
                table: "Segments",
                type: "text",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Requirements",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "TransactionStatus",
                table: "RecordedSales",
                type: "text",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PaymentMethod",
                table: "RecordedSales",
                type: "text",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<TimeSpan>(
                name: "EstimatedDuration",
                table: "Phases",
                type: "interval",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.CreateIndex(
                name: "IX_Negotiations_EventId",
                table: "Negotiations",
                column: "EventId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Negotiations_PerformerId",
                table: "Negotiations",
                column: "PerformerId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_NegotiationRequirementFulfillments_Phases_PhaseId",
                table: "NegotiationRequirementFulfillments",
                column: "PhaseId",
                principalTable: "Phases",
                principalColumn: "PhaseId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
