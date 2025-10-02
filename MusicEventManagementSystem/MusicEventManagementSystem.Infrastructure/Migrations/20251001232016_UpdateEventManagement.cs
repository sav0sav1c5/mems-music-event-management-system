using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MusicEventManagementSystem.Migrations
{
    /// <inheritdoc />
    public partial class UpdateEventManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.AlterColumn<string>(
                name: "CreatedById",
                table: "Events",
                type: "text",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<DateTime>(
                name: "EndInterval",
                table: "Events",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_WorkTasks_PerformanceId",
                table: "WorkTasks",
                column: "PerformanceId");

            migrationBuilder.CreateIndex(
                name: "IX_Performances_EventId",
                table: "Performances",
                column: "EventId");

            migrationBuilder.CreateIndex(
                name: "IX_Performances_PerformerId",
                table: "Performances",
                column: "PerformerId");

            migrationBuilder.CreateIndex(
                name: "IX_Performances_VenueId",
                table: "Performances",
                column: "VenueId");

            migrationBuilder.CreateIndex(
                name: "IX_PerformanceResources_PerformanceId",
                table: "PerformanceResources",
                column: "PerformanceId");

            migrationBuilder.CreateIndex(
                name: "IX_PerformanceResources_ResourceId",
                table: "PerformanceResources",
                column: "ResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_Events_CreatedById",
                table: "Events",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Events_LocationId",
                table: "Events",
                column: "LocationId");

            migrationBuilder.AddForeignKey(
                name: "FK_Events_AspNetUsers_CreatedById",
                table: "Events",
                column: "CreatedById",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Events_Locations_LocationId",
                table: "Events",
                column: "LocationId",
                principalTable: "Locations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PerformanceResources_Performances_PerformanceId",
                table: "PerformanceResources",
                column: "PerformanceId",
                principalTable: "Performances",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PerformanceResources_Resources_ResourceId",
                table: "PerformanceResources",
                column: "ResourceId",
                principalTable: "Resources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Performances_Events_EventId",
                table: "Performances",
                column: "EventId",
                principalTable: "Events",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Performances_Performers_PerformerId",
                table: "Performances",
                column: "PerformerId",
                principalTable: "Performers",
                principalColumn: "PerformerId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Performances_Venues_VenueId",
                table: "Performances",
                column: "VenueId",
                principalTable: "Venues",
                principalColumn: "VenueId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkTasks_Performances_PerformanceId",
                table: "WorkTasks",
                column: "PerformanceId",
                principalTable: "Performances",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Events_AspNetUsers_CreatedById",
                table: "Events");

            migrationBuilder.DropForeignKey(
                name: "FK_Events_Locations_LocationId",
                table: "Events");

            migrationBuilder.DropForeignKey(
                name: "FK_PerformanceResources_Performances_PerformanceId",
                table: "PerformanceResources");

            migrationBuilder.DropForeignKey(
                name: "FK_PerformanceResources_Resources_ResourceId",
                table: "PerformanceResources");

            migrationBuilder.DropForeignKey(
                name: "FK_Performances_Events_EventId",
                table: "Performances");

            migrationBuilder.DropForeignKey(
                name: "FK_Performances_Performers_PerformerId",
                table: "Performances");

            migrationBuilder.DropForeignKey(
                name: "FK_Performances_Venues_VenueId",
                table: "Performances");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkTasks_Performances_PerformanceId",
                table: "WorkTasks");

            migrationBuilder.DropIndex(
                name: "IX_WorkTasks_PerformanceId",
                table: "WorkTasks");

            migrationBuilder.DropIndex(
                name: "IX_Performances_EventId",
                table: "Performances");

            migrationBuilder.DropIndex(
                name: "IX_Performances_PerformerId",
                table: "Performances");

            migrationBuilder.DropIndex(
                name: "IX_Performances_VenueId",
                table: "Performances");

            migrationBuilder.DropIndex(
                name: "IX_PerformanceResources_PerformanceId",
                table: "PerformanceResources");

            migrationBuilder.DropIndex(
                name: "IX_PerformanceResources_ResourceId",
                table: "PerformanceResources");

            migrationBuilder.DropIndex(
                name: "IX_Events_CreatedById",
                table: "Events");

            migrationBuilder.DropIndex(
                name: "IX_Events_LocationId",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "PricingCondition",
                table: "PricingRules");

            migrationBuilder.DropColumn(
                name: "EndInterval",
                table: "Events");

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

            migrationBuilder.AlterColumn<Guid>(
                name: "CreatedById",
                table: "Events",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");
        }
    }
}
