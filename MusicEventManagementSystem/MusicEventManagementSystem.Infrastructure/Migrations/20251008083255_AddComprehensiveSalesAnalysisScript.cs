using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MusicEventManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddComprehensiveSalesAnalysisScript : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Read SQL script from file
            string sql = File.ReadAllText("../MusicEventManagementSystem.Infrastructure/Scripts/ComprehensiveSalesAnalysis.sql");

            // Execute SQL script
            migrationBuilder.Sql(sql);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Cleanup - delete the functions and table created by the script
            migrationBuilder.Sql(@"
                DROP FUNCTION IF EXISTS sp_comprehensive_sales_analysis_v2(integer, timestamp without time zone, timestamp without time zone);
                DROP FUNCTION IF EXISTS demonstrate_index_performance();
                DROP FUNCTION IF EXISTS get_sales_audit_log(integer);
                DROP TABLE IF EXISTS ""SalesAuditLog"";
            ");
        }
    }
}
