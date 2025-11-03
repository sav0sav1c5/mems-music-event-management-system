using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MusicEventManagementSystem.Migrations
{
    /// <inheritdoc />
    public partial class AddContractUpdateActionToRequirement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ContractUpdateAction",
                table: "Requirements",
                type: "text",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 1,
                columns: new[] { "ContractUpdateAction", "CreatedAt", "UpdatedAt" },
                values: new object[] { null, new DateTime(2025, 10, 11, 8, 46, 18, 787, DateTimeKind.Utc).AddTicks(2551), new DateTime(2025, 10, 11, 8, 46, 18, 787, DateTimeKind.Utc).AddTicks(2551) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 2,
                columns: new[] { "ContractUpdateAction", "CreatedAt", "UpdatedAt" },
                values: new object[] { null, new DateTime(2025, 10, 11, 8, 46, 18, 787, DateTimeKind.Utc).AddTicks(2551), new DateTime(2025, 10, 11, 8, 46, 18, 787, DateTimeKind.Utc).AddTicks(2551) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 3,
                columns: new[] { "ContractUpdateAction", "CreatedAt", "UpdatedAt" },
                values: new object[] { null, new DateTime(2025, 10, 11, 8, 46, 18, 787, DateTimeKind.Utc).AddTicks(2551), new DateTime(2025, 10, 11, 8, 46, 18, 787, DateTimeKind.Utc).AddTicks(2551) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 4,
                columns: new[] { "ContractUpdateAction", "CreatedAt", "UpdatedAt" },
                values: new object[] { null, new DateTime(2025, 10, 11, 8, 46, 18, 787, DateTimeKind.Utc).AddTicks(2551), new DateTime(2025, 10, 11, 8, 46, 18, 787, DateTimeKind.Utc).AddTicks(2551) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 5,
                columns: new[] { "ContractUpdateAction", "CreatedAt", "UpdatedAt" },
                values: new object[] { null, new DateTime(2025, 10, 11, 8, 46, 18, 787, DateTimeKind.Utc).AddTicks(2551), new DateTime(2025, 10, 11, 8, 46, 18, 787, DateTimeKind.Utc).AddTicks(2551) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 6,
                columns: new[] { "ContractUpdateAction", "CreatedAt", "UpdatedAt" },
                values: new object[] { null, new DateTime(2025, 10, 11, 8, 46, 18, 787, DateTimeKind.Utc).AddTicks(2551), new DateTime(2025, 10, 11, 8, 46, 18, 787, DateTimeKind.Utc).AddTicks(2551) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 7,
                columns: new[] { "ContractUpdateAction", "CreatedAt", "UpdatedAt" },
                values: new object[] { null, new DateTime(2025, 10, 11, 8, 46, 18, 787, DateTimeKind.Utc).AddTicks(2551), new DateTime(2025, 10, 11, 8, 46, 18, 787, DateTimeKind.Utc).AddTicks(2551) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 8,
                columns: new[] { "ContractUpdateAction", "CreatedAt", "UpdatedAt" },
                values: new object[] { null, new DateTime(2025, 10, 11, 8, 46, 18, 787, DateTimeKind.Utc).AddTicks(2551), new DateTime(2025, 10, 11, 8, 46, 18, 787, DateTimeKind.Utc).AddTicks(2551) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 9,
                columns: new[] { "ContractUpdateAction", "CreatedAt", "UpdatedAt" },
                values: new object[] { null, new DateTime(2025, 10, 11, 8, 46, 18, 787, DateTimeKind.Utc).AddTicks(2551), new DateTime(2025, 10, 11, 8, 46, 18, 787, DateTimeKind.Utc).AddTicks(2551) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 10,
                columns: new[] { "ContractUpdateAction", "CreatedAt", "UpdatedAt" },
                values: new object[] { null, new DateTime(2025, 10, 11, 8, 46, 18, 787, DateTimeKind.Utc).AddTicks(2551), new DateTime(2025, 10, 11, 8, 46, 18, 787, DateTimeKind.Utc).AddTicks(2551) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 11,
                columns: new[] { "ContractUpdateAction", "CreatedAt", "UpdatedAt" },
                values: new object[] { null, new DateTime(2025, 10, 11, 8, 46, 18, 787, DateTimeKind.Utc).AddTicks(2551), new DateTime(2025, 10, 11, 8, 46, 18, 787, DateTimeKind.Utc).AddTicks(2551) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 12,
                columns: new[] { "ContractUpdateAction", "CreatedAt", "UpdatedAt" },
                values: new object[] { null, new DateTime(2025, 10, 11, 8, 46, 18, 787, DateTimeKind.Utc).AddTicks(2551), new DateTime(2025, 10, 11, 8, 46, 18, 787, DateTimeKind.Utc).AddTicks(2551) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 13,
                columns: new[] { "ContractUpdateAction", "CreatedAt", "UpdatedAt" },
                values: new object[] { null, new DateTime(2025, 10, 11, 8, 46, 18, 787, DateTimeKind.Utc).AddTicks(2551), new DateTime(2025, 10, 11, 8, 46, 18, 787, DateTimeKind.Utc).AddTicks(2551) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 14,
                columns: new[] { "ContractUpdateAction", "CreatedAt", "UpdatedAt" },
                values: new object[] { null, new DateTime(2025, 10, 11, 8, 46, 18, 787, DateTimeKind.Utc).AddTicks(2551), new DateTime(2025, 10, 11, 8, 46, 18, 787, DateTimeKind.Utc).AddTicks(2551) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 15,
                columns: new[] { "ContractUpdateAction", "CreatedAt", "UpdatedAt" },
                values: new object[] { null, new DateTime(2025, 10, 11, 8, 46, 18, 787, DateTimeKind.Utc).AddTicks(2551), new DateTime(2025, 10, 11, 8, 46, 18, 787, DateTimeKind.Utc).AddTicks(2551) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContractUpdateAction",
                table: "Requirements");

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 28, 21, 35, 3, 981, DateTimeKind.Utc).AddTicks(457), new DateTime(2025, 9, 28, 21, 35, 3, 981, DateTimeKind.Utc).AddTicks(457) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 2,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 28, 21, 35, 3, 981, DateTimeKind.Utc).AddTicks(457), new DateTime(2025, 9, 28, 21, 35, 3, 981, DateTimeKind.Utc).AddTicks(457) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 3,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 28, 21, 35, 3, 981, DateTimeKind.Utc).AddTicks(457), new DateTime(2025, 9, 28, 21, 35, 3, 981, DateTimeKind.Utc).AddTicks(457) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 4,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 28, 21, 35, 3, 981, DateTimeKind.Utc).AddTicks(457), new DateTime(2025, 9, 28, 21, 35, 3, 981, DateTimeKind.Utc).AddTicks(457) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 5,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 28, 21, 35, 3, 981, DateTimeKind.Utc).AddTicks(457), new DateTime(2025, 9, 28, 21, 35, 3, 981, DateTimeKind.Utc).AddTicks(457) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 6,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 28, 21, 35, 3, 981, DateTimeKind.Utc).AddTicks(457), new DateTime(2025, 9, 28, 21, 35, 3, 981, DateTimeKind.Utc).AddTicks(457) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 7,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 28, 21, 35, 3, 981, DateTimeKind.Utc).AddTicks(457), new DateTime(2025, 9, 28, 21, 35, 3, 981, DateTimeKind.Utc).AddTicks(457) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 8,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 28, 21, 35, 3, 981, DateTimeKind.Utc).AddTicks(457), new DateTime(2025, 9, 28, 21, 35, 3, 981, DateTimeKind.Utc).AddTicks(457) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 9,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 28, 21, 35, 3, 981, DateTimeKind.Utc).AddTicks(457), new DateTime(2025, 9, 28, 21, 35, 3, 981, DateTimeKind.Utc).AddTicks(457) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 10,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 28, 21, 35, 3, 981, DateTimeKind.Utc).AddTicks(457), new DateTime(2025, 9, 28, 21, 35, 3, 981, DateTimeKind.Utc).AddTicks(457) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 11,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 28, 21, 35, 3, 981, DateTimeKind.Utc).AddTicks(457), new DateTime(2025, 9, 28, 21, 35, 3, 981, DateTimeKind.Utc).AddTicks(457) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 12,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 28, 21, 35, 3, 981, DateTimeKind.Utc).AddTicks(457), new DateTime(2025, 9, 28, 21, 35, 3, 981, DateTimeKind.Utc).AddTicks(457) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 13,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 28, 21, 35, 3, 981, DateTimeKind.Utc).AddTicks(457), new DateTime(2025, 9, 28, 21, 35, 3, 981, DateTimeKind.Utc).AddTicks(457) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 14,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 28, 21, 35, 3, 981, DateTimeKind.Utc).AddTicks(457), new DateTime(2025, 9, 28, 21, 35, 3, 981, DateTimeKind.Utc).AddTicks(457) });

            migrationBuilder.UpdateData(
                table: "Requirements",
                keyColumn: "RequirementId",
                keyValue: 15,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 28, 21, 35, 3, 981, DateTimeKind.Utc).AddTicks(457), new DateTime(2025, 9, 28, 21, 35, 3, 981, DateTimeKind.Utc).AddTicks(457) });
        }
    }
}
