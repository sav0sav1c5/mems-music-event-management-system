using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MusicEventManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRevenueAnalysisFunction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Učitaj SQL skriptu iz fajla
            var sqlScript = @"
            CREATE OR REPLACE FUNCTION calculate_total_revenue(
                p_start_date TIMESTAMP,
                p_end_date TIMESTAMP
            )
            RETURNS TABLE (
                total_revenue DECIMAL(18,2),
                total_sales INTEGER,
                average_sale_amount DECIMAL(18,2),
                period_start TIMESTAMP,
                period_end TIMESTAMP
            ) AS $$
            BEGIN
                RETURN QUERY
                SELECT 
                    COALESCE(SUM(rs.""TotalAmount""), 0)::DECIMAL(18,2) AS total_revenue,
                    COUNT(rs.""RecordedSaleId"")::INTEGER AS total_sales,
                    COALESCE(AVG(rs.""TotalAmount""), 0)::DECIMAL(18,2) AS average_sale_amount,
                    p_start_date AS period_start,
                    p_end_date AS period_end
                FROM ""RecordedSales"" rs
                WHERE rs.""SaleDate"" BETWEEN p_start_date AND p_end_date
                    AND rs.""TransactionStatus"" = 1;
            END;
            $$ LANGUAGE plpgsql;
            ";

            migrationBuilder.Sql(sqlScript);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS calculate_total_revenue;");
        }
    }
}
