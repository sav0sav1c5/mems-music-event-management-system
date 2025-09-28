using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MusicEventManagementSystem.Migrations
{
    /// <inheritdoc />
    public partial class ManuallyRemoveUniqueConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Manually remove the unique constraints that are preventing multiple negotiations per event/performer
            migrationBuilder.Sql("DROP INDEX IF EXISTS \"IX_Negotiations_EventId\";");
            migrationBuilder.Sql("DROP INDEX IF EXISTS \"IX_Negotiations_PerformerId\";");
            
            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 38, 27, 369, DateTimeKind.Utc).AddTicks(7370), new DateTime(2025, 9, 27, 21, 38, 27, 369, DateTimeKind.Utc).AddTicks(7370) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 2,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 38, 27, 369, DateTimeKind.Utc).AddTicks(7370), new DateTime(2025, 9, 27, 21, 38, 27, 369, DateTimeKind.Utc).AddTicks(7370) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 3,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 38, 27, 369, DateTimeKind.Utc).AddTicks(7370), new DateTime(2025, 9, 27, 21, 38, 27, 369, DateTimeKind.Utc).AddTicks(7370) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 4,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 38, 27, 369, DateTimeKind.Utc).AddTicks(7370), new DateTime(2025, 9, 27, 21, 38, 27, 369, DateTimeKind.Utc).AddTicks(7370) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 5,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 38, 27, 369, DateTimeKind.Utc).AddTicks(7370), new DateTime(2025, 9, 27, 21, 38, 27, 369, DateTimeKind.Utc).AddTicks(7370) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 6,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 38, 27, 369, DateTimeKind.Utc).AddTicks(7370), new DateTime(2025, 9, 27, 21, 38, 27, 369, DateTimeKind.Utc).AddTicks(7370) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 7,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 38, 27, 369, DateTimeKind.Utc).AddTicks(7370), new DateTime(2025, 9, 27, 21, 38, 27, 369, DateTimeKind.Utc).AddTicks(7370) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 8,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 38, 27, 369, DateTimeKind.Utc).AddTicks(7370), new DateTime(2025, 9, 27, 21, 38, 27, 369, DateTimeKind.Utc).AddTicks(7370) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 9,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 38, 27, 369, DateTimeKind.Utc).AddTicks(7370), new DateTime(2025, 9, 27, 21, 38, 27, 369, DateTimeKind.Utc).AddTicks(7370) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 10,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 38, 27, 369, DateTimeKind.Utc).AddTicks(7370), new DateTime(2025, 9, 27, 21, 38, 27, 369, DateTimeKind.Utc).AddTicks(7370) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 11,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 38, 27, 369, DateTimeKind.Utc).AddTicks(7370), new DateTime(2025, 9, 27, 21, 38, 27, 369, DateTimeKind.Utc).AddTicks(7370) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 12,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 38, 27, 369, DateTimeKind.Utc).AddTicks(7370), new DateTime(2025, 9, 27, 21, 38, 27, 369, DateTimeKind.Utc).AddTicks(7370) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 13,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 38, 27, 369, DateTimeKind.Utc).AddTicks(7370), new DateTime(2025, 9, 27, 21, 38, 27, 369, DateTimeKind.Utc).AddTicks(7370) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 14,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 38, 27, 369, DateTimeKind.Utc).AddTicks(7370), new DateTime(2025, 9, 27, 21, 38, 27, 369, DateTimeKind.Utc).AddTicks(7370) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 15,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 27, 21, 38, 27, 369, DateTimeKind.Utc).AddTicks(7370), new DateTime(2025, 9, 27, 21, 38, 27, 369, DateTimeKind.Utc).AddTicks(7370) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
    }
}
