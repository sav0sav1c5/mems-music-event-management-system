using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MusicEventManagementSystem.Migrations
{
    /// <inheritdoc />
    public partial class Addition : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Ads_AdTypes_AdTypeId",
                table: "Ads");

            migrationBuilder.DropForeignKey(
                name: "FK_Ads_Campaigns_CampaignId",
                table: "Ads");

            migrationBuilder.DropForeignKey(
                name: "FK_Ads_MediaWorkflows_MediaWorkflowId",
                table: "Ads");

            migrationBuilder.DropIndex(
                name: "IX_Ads_AdTypeId",
                table: "Ads");

            migrationBuilder.DropIndex(
                name: "IX_Ads_CampaignId",
                table: "Ads");

            migrationBuilder.DropIndex(
                name: "IX_Ads_MediaWorkflowId",
                table: "Ads");

            migrationBuilder.DropColumn(
                name: "TypeId",
                table: "Ads");

            migrationBuilder.DropColumn(
                name: "WorkflowId",
                table: "Ads");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TypeId",
                table: "Ads",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "WorkflowId",
                table: "Ads",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Ads_AdTypeId",
                table: "Ads",
                column: "AdTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Ads_CampaignId",
                table: "Ads",
                column: "CampaignId");

            migrationBuilder.CreateIndex(
                name: "IX_Ads_MediaWorkflowId",
                table: "Ads",
                column: "MediaWorkflowId");

            migrationBuilder.AddForeignKey(
                name: "FK_Ads_AdTypes_AdTypeId",
                table: "Ads",
                column: "AdTypeId",
                principalTable: "AdTypes",
                principalColumn: "AdTypeId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Ads_Campaigns_CampaignId",
                table: "Ads",
                column: "CampaignId",
                principalTable: "Campaigns",
                principalColumn: "CampaignId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Ads_MediaWorkflows_MediaWorkflowId",
                table: "Ads",
                column: "MediaWorkflowId",
                principalTable: "MediaWorkflows",
                principalColumn: "MediaWorkflowId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
