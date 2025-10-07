using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MusicEventManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSalesAnalysisStoredProcedures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Glavna stored procedure za kompleksnu analizu
            migrationBuilder.Sql(@"
                CREATE OR REPLACE FUNCTION sp_comprehensive_sales_analysis(
                    p_event_id INTEGER DEFAULT NULL,
                    p_start_date TIMESTAMP DEFAULT NULL,
                    p_end_date TIMESTAMP DEFAULT NULL
                )
                RETURNS TABLE (
                    analysis_section VARCHAR(100),
                    metric_name VARCHAR(200),
                    metric_value DECIMAL(18,2),
                    metric_unit VARCHAR(50),
                    additional_info JSONB
                ) AS $$
                DECLARE
                    v_total_revenue DECIMAL(18,2);
                    v_total_tickets_sold INTEGER;
                    v_total_capacity INTEGER;
                    v_event_count INTEGER;
                BEGIN
                    -- Postavi default vrednosti ako nisu prosleđene
                    p_start_date := COALESCE(p_start_date, CURRENT_TIMESTAMP - INTERVAL '30 days');
                    p_end_date := COALESCE(p_end_date, CURRENT_TIMESTAMP);

                    -- ===========================================
                    -- SEKCIJA 1: OSNOVNE METRIKE
                    -- ===========================================
                    
                    -- Ukupan revenue
                    SELECT COALESCE(SUM(rs.TotalAmount), 0)
                    INTO v_total_revenue
                    FROM ""RecordedSales"" rs
                    WHERE rs.""SaleDate"" BETWEEN p_start_date AND p_end_date
                        AND (p_event_id IS NULL OR EXISTS (
                            SELECT 1 FROM ""Tickets"" t
                            JOIN ""TicketTypes"" tt ON t.""TicketTypeId"" = tt.""TicketTypeId""
                            WHERE t.""RecordedSaleId"" = rs.""RecordedSaleId""
                            AND tt.""EventId"" = p_event_id
                        ));
                    
                    RETURN QUERY
                    SELECT 
                        'OSNOVNE_METRIKE'::VARCHAR(100),
                        'Ukupan Revenue'::VARCHAR(200),
                        v_total_revenue,
                        'RSD'::VARCHAR(50),
                        jsonb_build_object(
                            'period_start', p_start_date,
                            'period_end', p_end_date
                        );

                    -- Ukupno prodatih karata
                    SELECT COUNT(*)
                    INTO v_total_tickets_sold
                    FROM ""Tickets"" t
                    JOIN ""TicketTypes"" tt ON t.""TicketTypeId"" = tt.""TicketTypeId""
                    WHERE t.""RecordedSaleId"" IS NOT NULL
                        AND t.""IssueDate"" BETWEEN p_start_date AND p_end_date
                        AND (p_event_id IS NULL OR tt.""EventId"" = p_event_id);
                    
                    RETURN QUERY
                    SELECT 
                        'OSNOVNE_METRIKE'::VARCHAR(100),
                        'Ukupno Prodatih Karata'::VARCHAR(200),
                        v_total_tickets_sold::DECIMAL(18,2),
                        'kom'::VARCHAR(50),
                        NULL::JSONB;

                    -- Prosečna cena karte
                    RETURN QUERY
                    SELECT 
                        'OSNOVNE_METRIKE'::VARCHAR(100),
                        'Prosečna Cena Karte'::VARCHAR(200),
                        CASE WHEN v_total_tickets_sold > 0 
                            THEN v_total_revenue / v_total_tickets_sold 
                            ELSE 0 
                        END,
                        'RSD'::VARCHAR(50),
                        NULL::JSONB;

                    -- ===========================================
                    -- SEKCIJA 2: ANALIZA PO ZONAMA
                    -- ===========================================
                    
                    RETURN QUERY
                    WITH zone_analysis AS (
                        SELECT 
                            z.""ZoneId"",
                            z.""Name"" AS zone_name,
                            z.""BasePrice"",
                            z.""Position"",
                            COUNT(t.""TicketId"") AS tickets_sold,
                            SUM(t.""FinalPrice"") AS zone_revenue,
                            AVG(t.""FinalPrice"") AS avg_price,
                            z.""Capacity"",
                            ROUND(COUNT(t.""TicketId"")::DECIMAL / NULLIF(z.""Capacity"", 0) * 100, 2) AS occupancy_rate
                        FROM ""Zones"" z
                        JOIN ""TicketTypes"" tt ON z.""ZoneId"" = tt.""ZoneId""
                        LEFT JOIN ""Tickets"" t ON tt.""TicketTypeId"" = t.""TicketTypeId"" 
                            AND t.""RecordedSaleId"" IS NOT NULL
                            AND t.""IssueDate"" BETWEEN p_start_date AND p_end_date
                        WHERE (p_event_id IS NULL OR tt.""EventId"" = p_event_id)
                        GROUP BY z.""ZoneId"", z.""Name"", z.""BasePrice"", z.""Position"", z.""Capacity""
                    )
                    SELECT 
                        'ANALIZA_PO_ZONAMA'::VARCHAR(100),
                        'Zona: ' || zone_name::VARCHAR(200),
                        zone_revenue,
                        'RSD'::VARCHAR(50),
                        jsonb_build_object(
                            'zone_id', ""ZoneId"",
                            'tickets_sold', tickets_sold,
                            'avg_price', avg_price,
                            'base_price', ""BasePrice"",
                            'price_variance', ROUND((avg_price - ""BasePrice"") / NULLIF(""BasePrice"", 0) * 100, 2),
                            'occupancy_rate', occupancy_rate,
                            'position', ""Position""
                        )
                    FROM zone_analysis
                    ORDER BY zone_revenue DESC;

                    -- ===========================================
                    -- SEKCIJA 3: PRICING RULES EFIKASNOST
                    -- ===========================================
                    
                    RETURN QUERY
                    WITH pricing_effectiveness AS (
                        SELECT 
                            pr.""PricingRuleId"",
                            pr.""Name"" AS rule_name,
                            COUNT(DISTINCT t.""TicketId"") AS tickets_affected,
                            AVG(t.""FinalPrice"") AS avg_final_price,
                            AVG(z.""BasePrice"") AS avg_base_price,
                            SUM(t.""FinalPrice"") AS total_revenue,
                            ROUND(AVG((t.""FinalPrice"" - z.""BasePrice"") / NULLIF(z.""BasePrice"", 0) * 100), 2) AS avg_price_change_pct
                        FROM ""PricingRules"" pr
                        JOIN ""TicketTypes"" tt ON pr.""PricingRuleId"" = ANY(
                            SELECT unnest(array_agg(ptr.""PricingRuleId""))
                            FROM ""PricingRules"" ptr
                            JOIN ""TicketTypes"" tt2 ON ptr.""PricingRuleId"" = ANY(
                                SELECT ""PricingRuleId"" FROM ""PricingRules""
                            )
                        )
                        JOIN ""Tickets"" t ON tt.""TicketTypeId"" = t.""TicketTypeId""
                        JOIN ""Zones"" z ON tt.""ZoneId"" = z.""ZoneId""
                        WHERE t.""RecordedSaleId"" IS NOT NULL
                            AND t.""IssueDate"" BETWEEN p_start_date AND p_end_date
                            AND (p_event_id IS NULL OR tt.""EventId"" = p_event_id)
                        GROUP BY pr.""PricingRuleId"", pr.""Name""
                    )
                    SELECT 
                        'PRICING_RULES_EFIKASNOST'::VARCHAR(100),
                        'Pravilo: ' || rule_name::VARCHAR(200),
                        total_revenue,
                        'RSD'::VARCHAR(50),
                        jsonb_build_object(
                            'pricing_rule_id', ""PricingRuleId"",
                            'tickets_affected', tickets_affected,
                            'avg_final_price', avg_final_price,
                            'avg_base_price', avg_base_price,
                            'avg_price_change_pct', avg_price_change_pct,
                            'revenue_per_ticket', ROUND(total_revenue / NULLIF(tickets_affected, 0), 2)
                        )
                    FROM pricing_effectiveness
                    ORDER BY total_revenue DESC;

                    -- ===========================================
                    -- SEKCIJA 4: SPECIAL OFFERS PERFORMANCE
                    -- ===========================================
                    
                    RETURN QUERY
                    WITH offer_performance AS (
                        SELECT 
                            so.""SpecialOfferId"",
                            so.""Name"" AS offer_name,
                            so.""OfferType"",
                            so.""DiscountValue"",
                            COUNT(DISTINCT rs.""RecordedSaleId"") AS sales_count,
                            COUNT(DISTINCT t.""TicketId"") AS tickets_sold,
                            SUM(t.""FinalPrice"") AS revenue_generated,
                            SUM(z.""BasePrice"" - t.""FinalPrice"") AS total_discount_given,
                            ROUND(AVG(t.""FinalPrice""), 2) AS avg_ticket_price
                        FROM ""SpecialOffers"" so
                        JOIN ""RecordedSales"" rs ON so.""SpecialOfferId"" = ANY(
                            SELECT unnest(array_agg(rso.""SpecialOfferId""))
                            FROM ""SpecialOffers"" rso
                        )
                        JOIN ""Tickets"" t ON rs.""RecordedSaleId"" = t.""RecordedSaleId""
                        JOIN ""TicketTypes"" tt ON t.""TicketTypeId"" = tt.""TicketTypeId""
                        JOIN ""Zones"" z ON tt.""ZoneId"" = z.""ZoneId""
                        WHERE rs.""SaleDate"" BETWEEN p_start_date AND p_end_date
                            AND so.""StartDate"" <= p_end_date
                            AND so.""EndDate"" >= p_start_date
                            AND (p_event_id IS NULL OR tt.""EventId"" = p_event_id)
                        GROUP BY so.""SpecialOfferId"", so.""Name"", so.""OfferType"", so.""DiscountValue""
                    )
                    SELECT 
                        'SPECIAL_OFFERS_PERFORMANCE'::VARCHAR(100),
                        'Ponuda: ' || offer_name::VARCHAR(200),
                        revenue_generated,
                        'RSD'::VARCHAR(50),
                        jsonb_build_object(
                            'offer_id', ""SpecialOfferId"",
                            'offer_type', ""OfferType"",
                            'discount_value', ""DiscountValue"",
                            'sales_count', sales_count,
                            'tickets_sold', tickets_sold,
                            'total_discount_given', total_discount_given,
                            'avg_ticket_price', avg_ticket_price,
                            'roi', ROUND((revenue_generated / NULLIF(total_discount_given, 0) - 1) * 100, 2)
                        )
                    FROM offer_performance
                    ORDER BY revenue_generated DESC;

                    -- ===========================================
                    -- SEKCIJA 5: TREND ANALIZA (VELOCITY)
                    -- ===========================================
                    
                    RETURN QUERY
                    WITH daily_sales AS (
                        SELECT 
                            DATE(t.""IssueDate"") AS sale_date,
                            COUNT(*) AS tickets_sold,
                            SUM(t.""FinalPrice"") AS daily_revenue
                        FROM ""Tickets"" t
                        JOIN ""TicketTypes"" tt ON t.""TicketTypeId"" = tt.""TicketTypeId""
                        WHERE t.""RecordedSaleId"" IS NOT NULL
                            AND t.""IssueDate"" BETWEEN p_start_date AND p_end_date
                            AND (p_event_id IS NULL OR tt.""EventId"" = p_event_id)
                        GROUP BY DATE(t.""IssueDate"")
                    ),
                    velocity_metrics AS (
                        SELECT 
                            AVG(tickets_sold) AS avg_daily_tickets,
                            STDDEV(tickets_sold) AS stddev_daily_tickets,
                            MAX(tickets_sold) AS peak_daily_tickets,
                            AVG(daily_revenue) AS avg_daily_revenue
                        FROM daily_sales
                    )
                    SELECT 
                        'TREND_ANALIZA'::VARCHAR(100),
                        'Prosečna Dnevna Prodaja'::VARCHAR(200),
                        avg_daily_tickets,
                        'karata/dan'::VARCHAR(50),
                        jsonb_build_object(
                            'stddev', ROUND(stddev_daily_tickets, 2),
                            'peak', peak_daily_tickets,
                            'avg_revenue_per_day', ROUND(avg_daily_revenue, 2)
                        )
                    FROM velocity_metrics;

                    -- ===========================================
                    -- SEKCIJA 6: EVENT PERFORMANCE COMPARISON
                    -- ===========================================
                    
                    IF p_event_id IS NULL THEN
                        RETURN QUERY
                        WITH event_comparison AS (
                            SELECT 
                                e.""Id"" AS event_id,
                                e.""Name"" AS event_name,
                                e.""Status"",
                                COUNT(DISTINCT t.""TicketId"") AS tickets_sold,
                                SUM(t.""FinalPrice"") AS total_revenue,
                                SUM(tt.""AvailableQuantity"") AS total_capacity,
                                ROUND(COUNT(DISTINCT t.""TicketId"")::DECIMAL / NULLIF(SUM(tt.""AvailableQuantity""), 0) * 100, 2) AS overall_occupancy
                            FROM ""Events"" e
                            JOIN ""TicketTypes"" tt ON e.""Id"" = tt.""EventId""
                            LEFT JOIN ""Tickets"" t ON tt.""TicketTypeId"" = t.""TicketTypeId"" 
                                AND t.""RecordedSaleId"" IS NOT NULL
                                AND t.""IssueDate"" BETWEEN p_start_date AND p_end_date
                            GROUP BY e.""Id"", e.""Name"", e.""Status""
                        )
                        SELECT 
                            'EVENT_COMPARISON'::VARCHAR(100),
                            'Event: ' || event_name::VARCHAR(200),
                            total_revenue,
                            'RSD'::VARCHAR(50),
                            jsonb_build_object(
                                'event_id', event_id,
                                'status', ""Status"",
                                'tickets_sold', tickets_sold,
                                'total_capacity', total_capacity,
                                'occupancy_rate', overall_occupancy,
                                'revenue_per_ticket', ROUND(total_revenue / NULLIF(tickets_sold, 0), 2)
                            )
                        FROM event_comparison
                        ORDER BY total_revenue DESC;
                    END IF;

                    -- ===========================================
                    -- SEKCIJA 7: REVENUE OPTIMIZATION INSIGHTS
                    -- ===========================================
                    
                    RETURN QUERY
                    WITH optimization_data AS (
                        SELECT 
                            COUNT(*) FILTER (WHERE t.""Status"" = 0) AS available_tickets, -- Assuming 0 = Available
                            COUNT(*) FILTER (WHERE t.""Status"" = 1) AS sold_tickets,      -- Assuming 1 = Sold
                            SUM(z.""BasePrice"") FILTER (WHERE t.""Status"" = 0) AS potential_revenue_lost,
                            AVG(t.""FinalPrice"") FILTER (WHERE t.""FinalPrice"" < z.""BasePrice"") AS avg_discounted_price,
                            COUNT(*) FILTER (WHERE t.""FinalPrice"" < z.""BasePrice"") AS discounted_tickets_count
                        FROM ""TicketTypes"" tt
                        JOIN ""Zones"" z ON tt.""ZoneId"" = z.""ZoneId""
                        LEFT JOIN ""Tickets"" t ON tt.""TicketTypeId"" = t.""TicketTypeId""
                        WHERE (p_event_id IS NULL OR tt.""EventId"" = p_event_id)
                    )
                    SELECT 
                        'REVENUE_OPTIMIZATION'::VARCHAR(100),
                        'Potencijalni Izgubljeni Revenue'::VARCHAR(200),
                        COALESCE(potential_revenue_lost, 0),
                        'RSD'::VARCHAR(50),
                        jsonb_build_object(
                            'available_tickets', available_tickets,
                            'sold_tickets', sold_tickets,
                            'discounted_tickets', discounted_tickets_count,
                            'avg_discount_price', ROUND(avg_discounted_price, 2),
                            'recommendation', CASE 
                                WHEN available_tickets > sold_tickets * 0.5 
                                THEN 'Razmislite o agresivnijim special offers'
                                WHEN discounted_tickets_count > sold_tickets * 0.3
                                THEN 'Previše popusta - možda smanjiti discount vrednosti'
                                ELSE 'Pricing strategija izgleda balansirana'
                            END
                        )
                    FROM optimization_data;

                    RETURN;
                END;
                $$ LANGUAGE plpgsql;
            ");

            // 2. Helper funkcija za CSV export
            migrationBuilder.Sql(@"
                CREATE OR REPLACE FUNCTION sp_export_sales_analysis_csv(
                    p_event_id INTEGER DEFAULT NULL,
                    p_start_date TIMESTAMP DEFAULT NULL,
                    p_end_date TIMESTAMP DEFAULT NULL
                )
                RETURNS TEXT AS $$
                DECLARE
                    v_result TEXT := 'Sekcija,Metrika,Vrednost,Jedinica' || CHR(10);
                    v_row RECORD;
                BEGIN
                    FOR v_row IN 
                        SELECT * FROM sp_comprehensive_sales_analysis(p_event_id, p_start_date, p_end_date)
                    LOOP
                        v_result := v_result || 
                            v_row.analysis_section || ',' || 
                            v_row.metric_name || ',' || 
                            v_row.metric_value || ',' || 
                            v_row.metric_unit || CHR(10);
                    END LOOP;
                    
                    RETURN v_result;
                END;
                $$ LANGUAGE plpgsql;
            ");

            // 3. Dodaj performance indekse (opciono, ali preporučljivo)
            migrationBuilder.Sql(@"
                CREATE INDEX IF NOT EXISTS idx_tickets_issue_date_status 
                ON ""Tickets"" (""IssueDate"", ""Status"") 
                WHERE ""RecordedSaleId"" IS NOT NULL;

                CREATE INDEX IF NOT EXISTS idx_recorded_sales_date 
                ON ""RecordedSales"" (""SaleDate"");

                CREATE INDEX IF NOT EXISTS idx_ticket_types_event 
                ON ""TicketTypes"" (""EventId"");

                CREATE INDEX IF NOT EXISTS idx_zones_capacity 
                ON ""Zones"" (""Capacity"");
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Cleanup - obriši sve što smo kreirali u Up() metodi
            migrationBuilder.Sql(@"
                DROP FUNCTION IF EXISTS sp_comprehensive_sales_analysis;
                DROP FUNCTION IF EXISTS sp_export_sales_analysis_csv;
                
                DROP INDEX IF EXISTS idx_tickets_issue_date_status;
                DROP INDEX IF EXISTS idx_recorded_sales_date;
                DROP INDEX IF EXISTS idx_ticket_types_event;
                DROP INDEX IF EXISTS idx_zones_capacity;
            ");
        }
    }
}