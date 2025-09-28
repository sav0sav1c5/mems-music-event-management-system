using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MusicEventManagementSystem.Migrations
{
    /// <inheritdoc />
    public partial class FixNegotiationRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Negotiations_Events_EventId1",
                table: "Negotiations");

            migrationBuilder.DropForeignKey(
                name: "FK_Negotiations_Performers_PerformerId1",
                table: "Negotiations");

            migrationBuilder.DropIndex(
                name: "IX_Negotiations_EventId1",
                table: "Negotiations");

            migrationBuilder.DropIndex(
                name: "IX_Negotiations_PerformerId1",
                table: "Negotiations");

            migrationBuilder.DropColumn(
                name: "EventId1",
                table: "Negotiations");

            migrationBuilder.DropColumn(
                name: "PerformerId1",
                table: "Negotiations");

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 32, 57, 454, DateTimeKind.Utc).AddTicks(5338), new DateTime(2025, 9, 27, 21, 32, 57, 454, DateTimeKind.Utc).AddTicks(5338) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 2,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 32, 57, 454, DateTimeKind.Utc).AddTicks(5338), new DateTime(2025, 9, 27, 21, 32, 57, 454, DateTimeKind.Utc).AddTicks(5338) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 3,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 32, 57, 454, DateTimeKind.Utc).AddTicks(5338), new DateTime(2025, 9, 27, 21, 32, 57, 454, DateTimeKind.Utc).AddTicks(5338) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 4,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 32, 57, 454, DateTimeKind.Utc).AddTicks(5338), new DateTime(2025, 9, 27, 21, 32, 57, 454, DateTimeKind.Utc).AddTicks(5338) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 5,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 32, 57, 454, DateTimeKind.Utc).AddTicks(5338), new DateTime(2025, 9, 27, 21, 32, 57, 454, DateTimeKind.Utc).AddTicks(5338) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 6,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 32, 57, 454, DateTimeKind.Utc).AddTicks(5338), new DateTime(2025, 9, 27, 21, 32, 57, 454, DateTimeKind.Utc).AddTicks(5338) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 7,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 32, 57, 454, DateTimeKind.Utc).AddTicks(5338), new DateTime(2025, 9, 27, 21, 32, 57, 454, DateTimeKind.Utc).AddTicks(5338) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 8,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 32, 57, 454, DateTimeKind.Utc).AddTicks(5338), new DateTime(2025, 9, 27, 21, 32, 57, 454, DateTimeKind.Utc).AddTicks(5338) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 9,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 32, 57, 454, DateTimeKind.Utc).AddTicks(5338), new DateTime(2025, 9, 27, 21, 32, 57, 454, DateTimeKind.Utc).AddTicks(5338) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 10,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 32, 57, 454, DateTimeKind.Utc).AddTicks(5338), new DateTime(2025, 9, 27, 21, 32, 57, 454, DateTimeKind.Utc).AddTicks(5338) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 11,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 32, 57, 454, DateTimeKind.Utc).AddTicks(5338), new DateTime(2025, 9, 27, 21, 32, 57, 454, DateTimeKind.Utc).AddTicks(5338) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 12,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 32, 57, 454, DateTimeKind.Utc).AddTicks(5338), new DateTime(2025, 9, 27, 21, 32, 57, 454, DateTimeKind.Utc).AddTicks(5338) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 13,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 32, 57, 454, DateTimeKind.Utc).AddTicks(5338), new DateTime(2025, 9, 27, 21, 32, 57, 454, DateTimeKind.Utc).AddTicks(5338) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 14,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 32, 57, 454, DateTimeKind.Utc).AddTicks(5338), new DateTime(2025, 9, 27, 21, 32, 57, 454, DateTimeKind.Utc).AddTicks(5338) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 15,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 32, 57, 454, DateTimeKind.Utc).AddTicks(5338), new DateTime(2025, 9, 27, 21, 32, 57, 454, DateTimeKind.Utc).AddTicks(5338) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944), new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 2,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944), new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 3,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944), new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 4,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944), new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 5,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944), new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 6,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944), new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 7,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944), new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 8,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944), new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 9,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944), new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 10,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944), new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 11,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944), new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 12,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944), new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 13,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944), new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 14,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944), new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 15,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944), new DateTime(2025, 9, 27, 21, 26, 43, 777, DateTimeKind.Utc).AddTicks(5944) });

            migrationBuilder.CreateIndex(
                name: "IX_Negotiations_EventId1",
                table: "Negotiations",
                column: "EventId1",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Negotiations_PerformerId1",
                table: "Negotiations",
                column: "PerformerId1",
                unique: true);

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
    }
}
