-- ============================================
-- COMPLEX TICKET SALES ANALYSIS REPORT
-- Music Event Management System
-- ============================================

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
BEGIN
    -- Postavi default vrednosti ako nisu prosleđene
    p_start_date := COALESCE(p_start_date, CURRENT_TIMESTAMP - INTERVAL '30 days');
    p_end_date := COALESCE(p_end_date, CURRENT_TIMESTAMP);

    -- ===========================================
    -- SEKCIJA 1: OSNOVNE METRIKE
    -- ===========================================
    
    -- Ukupan revenue
    SELECT COALESCE(SUM(rs."TotalAmount"), 0)
    INTO v_total_revenue
    FROM "RecordedSales" rs
    WHERE rs."SaleDate" BETWEEN p_start_date AND p_end_date
        AND (p_event_id IS NULL OR EXISTS (
            SELECT 1 FROM "Tickets" t
            JOIN "TicketTypes" tt ON t."TicketTypeId" = tt."TicketTypeId"
            WHERE t."RecordedSaleId" = rs."RecordedSaleId"
            AND tt."EventId" = p_event_id
        ));
    
    RETURN QUERY
    SELECT 
        'OSNOVNE_METRIKE'::VARCHAR(100),
        'Ukupan Revenue'::VARCHAR(200),
        v_total_revenue::DECIMAL(18,2),
        'RSD'::VARCHAR(50),
        jsonb_build_object(
            'period_start', p_start_date,
            'period_end', p_end_date
        )::JSONB;

    -- Ukupno prodatih karata
    SELECT COUNT(*)::INTEGER
    INTO v_total_tickets_sold
    FROM "Tickets" t
    JOIN "TicketTypes" tt ON t."TicketTypeId" = tt."TicketTypeId"
    WHERE t."RecordedSaleId" IS NOT NULL
        AND t."IssueDate" BETWEEN p_start_date AND p_end_date
        AND (p_event_id IS NULL OR tt."EventId" = p_event_id);
    
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
            THEN (v_total_revenue / v_total_tickets_sold)::DECIMAL(18,2)
            ELSE 0::DECIMAL(18,2)
        END,
        'RSD'::VARCHAR(50),
        NULL::JSONB;

    -- ===========================================
    -- SEKCIJA 2: ANALIZA PO ZONAMA
    -- ===========================================
    
    RETURN QUERY
    SELECT 
        'ANALIZA_PO_ZONAMA'::VARCHAR(100),
        ('Zona: ' || COALESCE(z."Name", 'N/A'))::VARCHAR(200),
        COALESCE(SUM(t."FinalPrice"), 0)::DECIMAL(18,2),
        'RSD'::VARCHAR(50),
        jsonb_build_object(
            'zone_id', z."ZoneId",
            'tickets_sold', COUNT(t."TicketId"),
            'avg_price', ROUND(COALESCE(AVG(t."FinalPrice"), 0)::NUMERIC, 2),
            'base_price', z."BasePrice",
            'price_variance', ROUND(
                CASE 
                    WHEN z."BasePrice" > 0 THEN 
                        ((COALESCE(AVG(t."FinalPrice"), 0) - z."BasePrice") / z."BasePrice" * 100)::NUMERIC
                    ELSE 0::NUMERIC
                END, 2
            ),
            'occupancy_rate', ROUND(
                CASE 
                    WHEN z."Capacity" > 0 THEN 
                        (COUNT(t."TicketId")::NUMERIC / z."Capacity" * 100)
                    ELSE 0::NUMERIC
                END, 2
            ),
            'position', z."Position"
        )::JSONB
    FROM "Zones" z
    JOIN "TicketTypes" tt ON z."ZoneId" = tt."ZoneId"
    LEFT JOIN "Tickets" t ON tt."TicketTypeId" = t."TicketTypeId" 
        AND t."RecordedSaleId" IS NOT NULL
        AND t."IssueDate" BETWEEN p_start_date AND p_end_date
    WHERE (p_event_id IS NULL OR tt."EventId" = p_event_id)
    GROUP BY z."ZoneId", z."Name", z."BasePrice", z."Position", z."Capacity"
    ORDER BY COALESCE(SUM(t."FinalPrice"), 0) DESC;

    -- ===========================================
    -- SEKCIJA 3: PRICING RULES EFIKASNOST
    -- ===========================================
    
    RETURN QUERY
    SELECT 
        'PRICING_RULES_EFIKASNOST'::VARCHAR(100),
        ('Pravilo: ' || COALESCE(pr."Name", 'N/A'))::VARCHAR(200),
        COALESCE(SUM(t."FinalPrice"), 0)::DECIMAL(18,2),
        'RSD'::VARCHAR(50),
        jsonb_build_object(
            'pricing_rule_id', pr."PricingRuleId",
            'tickets_affected', COUNT(DISTINCT t."TicketId"),
            'avg_final_price', ROUND(COALESCE(AVG(t."FinalPrice"), 0)::NUMERIC, 2),
            'avg_base_price', ROUND(COALESCE(AVG(z."BasePrice"), 0)::NUMERIC, 2),
            'avg_price_change_pct', ROUND(
                COALESCE(
                    AVG(
                        CASE 
                            WHEN z."BasePrice" > 0 THEN 
                                ((t."FinalPrice" - z."BasePrice") / z."BasePrice" * 100)
                            ELSE 0
                        END
                    ), 0
                )::NUMERIC, 2
            ),
            'revenue_per_ticket', ROUND(
                CASE 
                    WHEN COUNT(DISTINCT t."TicketId") > 0 THEN 
                        (COALESCE(SUM(t."FinalPrice"), 0) / COUNT(DISTINCT t."TicketId"))::NUMERIC
                    ELSE 0::NUMERIC
                END, 2
            )
        )::JSONB
    FROM "PricingRules" pr
    JOIN "TicketTypePricingRules" prtt ON pr."PricingRuleId" = prtt."PricingRulesPricingRuleId"
    JOIN "TicketTypes" tt ON prtt."TicketTypesTicketTypeId" = tt."TicketTypeId"
    JOIN "Zones" z ON tt."ZoneId" = z."ZoneId"
    LEFT JOIN "Tickets" t ON tt."TicketTypeId" = t."TicketTypeId"
        AND t."RecordedSaleId" IS NOT NULL
        AND t."IssueDate" BETWEEN p_start_date AND p_end_date
    WHERE (p_event_id IS NULL OR tt."EventId" = p_event_id)
    GROUP BY pr."PricingRuleId", pr."Name"
    HAVING COUNT(DISTINCT t."TicketId") > 0
    ORDER BY COALESCE(SUM(t."FinalPrice"), 0) DESC;

    -- ===========================================
    -- SEKCIJA 4: SPECIAL OFFERS PERFORMANCE
    -- ===========================================
    
    RETURN QUERY
    SELECT 
        'SPECIAL_OFFERS_PERFORMANCE'::VARCHAR(100),
        ('Ponuda: ' || COALESCE(so."Name", 'N/A'))::VARCHAR(200),
        COALESCE(SUM(t."FinalPrice"), 0)::DECIMAL(18,2),
        'RSD'::VARCHAR(50),
        jsonb_build_object(
            'offer_id', so."SpecialOfferId",
            'offer_type', so."OfferType",
            'discount_value', so."DiscountValue",
            'sales_count', COUNT(DISTINCT rs."RecordedSaleId"),
            'tickets_sold', COUNT(DISTINCT t."TicketId"),
            'total_discount_given', COALESCE(SUM(z."BasePrice" - t."FinalPrice"), 0),
            'avg_ticket_price', ROUND(COALESCE(AVG(t."FinalPrice"), 0)::NUMERIC, 2),
            'roi', ROUND(
                CASE 
                    WHEN SUM(z."BasePrice" - t."FinalPrice") > 0 THEN 
                        ((SUM(t."FinalPrice") / SUM(z."BasePrice" - t."FinalPrice") - 1) * 100)::NUMERIC
                    ELSE 0::NUMERIC
                END, 2
            )
        )::JSONB
    FROM "SpecialOffers" so
    JOIN "TicketTypeSpecialOffers" sott ON so."SpecialOfferId" = sott."SpecialOffersSpecialOfferId"
    JOIN "TicketTypes" tt ON sott."TicketTypesTicketTypeId" = tt."TicketTypeId"
    JOIN "Zones" z ON tt."ZoneId" = z."ZoneId"
    LEFT JOIN "Tickets" t ON tt."TicketTypeId" = t."TicketTypeId"
        AND t."RecordedSaleId" IS NOT NULL
        AND t."IssueDate" BETWEEN p_start_date AND p_end_date
    LEFT JOIN "RecordedSales" rs ON t."RecordedSaleId" = rs."RecordedSaleId"
    WHERE so."StartDate" <= p_end_date
        AND so."EndDate" >= p_start_date
        AND (p_event_id IS NULL OR tt."EventId" = p_event_id)
    GROUP BY so."SpecialOfferId", so."Name", so."OfferType", so."DiscountValue"
    HAVING COUNT(DISTINCT t."TicketId") > 0
    ORDER BY COALESCE(SUM(t."FinalPrice"), 0) DESC;

    -- ===========================================
    -- SEKCIJA 5: TREND ANALIZA (VELOCITY)
    -- ===========================================
    
    RETURN QUERY
    WITH daily_sales AS (
        SELECT 
            DATE(t."IssueDate") AS sale_date,
            COUNT(*)::INTEGER AS tickets_sold,
            SUM(t."FinalPrice")::DECIMAL(18,2) AS daily_revenue
        FROM "Tickets" t
        JOIN "TicketTypes" tt ON t."TicketTypeId" = tt."TicketTypeId"
        WHERE t."RecordedSaleId" IS NOT NULL
            AND t."IssueDate" BETWEEN p_start_date AND p_end_date
            AND (p_event_id IS NULL OR tt."EventId" = p_event_id)
        GROUP BY DATE(t."IssueDate")
    )
    SELECT 
        'TREND_ANALIZA'::VARCHAR(100),
        'Prosečna Dnevna Prodaja'::VARCHAR(200),
        COALESCE(AVG(tickets_sold), 0)::DECIMAL(18,2),
        'karata/dan'::VARCHAR(50),
        jsonb_build_object(
            'stddev', ROUND(COALESCE(STDDEV(tickets_sold), 0)::NUMERIC, 2),
            'peak', COALESCE(MAX(tickets_sold), 0),
            'avg_revenue_per_day', ROUND(COALESCE(AVG(daily_revenue), 0)::NUMERIC, 2)
        )::JSONB
    FROM daily_sales;

    -- ===========================================
    -- SEKCIJA 6: EVENT PERFORMANCE COMPARISON
    -- ===========================================
    
    IF p_event_id IS NULL THEN
        RETURN QUERY
        SELECT 
            'EVENT_COMPARISON'::VARCHAR(100),
            ('Event: ' || COALESCE(e."Name", 'N/A'))::VARCHAR(200),
            COALESCE(SUM(t."FinalPrice"), 0)::DECIMAL(18,2),
            'RSD'::VARCHAR(50),
            jsonb_build_object(
                'event_id', e."Id",
                'status', e."Status",
                'tickets_sold', COUNT(DISTINCT t."TicketId"),
                'total_capacity', SUM(tt."AvailableQuantity"),
                'occupancy_rate', ROUND(
                    CASE 
                        WHEN SUM(tt."AvailableQuantity") > 0 THEN 
                            (COUNT(DISTINCT t."TicketId")::NUMERIC / SUM(tt."AvailableQuantity") * 100)
                        ELSE 0::NUMERIC
                    END, 2
                ),
                'revenue_per_ticket', ROUND(
                    CASE 
                        WHEN COUNT(DISTINCT t."TicketId") > 0 THEN 
                            (COALESCE(SUM(t."FinalPrice"), 0) / COUNT(DISTINCT t."TicketId"))::NUMERIC
                        ELSE 0::NUMERIC
                    END, 2
                )
            )::JSONB
        FROM "Events" e
        JOIN "TicketTypes" tt ON e."Id" = tt."EventId"
        LEFT JOIN "Tickets" t ON tt."TicketTypeId" = t."TicketTypeId" 
            AND t."RecordedSaleId" IS NOT NULL
            AND t."IssueDate" BETWEEN p_start_date AND p_end_date
        GROUP BY e."Id", e."Name", e."Status"
        ORDER BY COALESCE(SUM(t."FinalPrice"), 0) DESC;
    END IF;

    -- ===========================================
    -- SEKCIJA 7: REVENUE OPTIMIZATION INSIGHTS
    -- ===========================================
    
    RETURN QUERY
    WITH optimization_data AS (
        SELECT 
            COUNT(*) FILTER (WHERE t."Status" = 0)::INTEGER AS available_tickets,
            COUNT(*) FILTER (WHERE t."Status" = 1)::INTEGER AS sold_tickets,
            COALESCE(SUM(z."BasePrice") FILTER (WHERE t."Status" = 0), 0)::DECIMAL(18,2) AS potential_revenue_lost,
            COALESCE(AVG(t."FinalPrice") FILTER (WHERE t."FinalPrice" < z."BasePrice"), 0)::DECIMAL(18,2) AS avg_discounted_price,
            COUNT(*) FILTER (WHERE t."FinalPrice" < z."BasePrice")::INTEGER AS discounted_tickets_count
        FROM "TicketTypes" tt
        JOIN "Zones" z ON tt."ZoneId" = z."ZoneId"
        LEFT JOIN "Tickets" t ON tt."TicketTypeId" = t."TicketTypeId"
        WHERE (p_event_id IS NULL OR tt."EventId" = p_event_id)
    )
    SELECT 
        'REVENUE_OPTIMIZATION'::VARCHAR(100),
        'Potencijalni Izgubljeni Revenue'::VARCHAR(200),
        potential_revenue_lost::DECIMAL(18,2),
        'RSD'::VARCHAR(50),
        jsonb_build_object(
            'available_tickets', available_tickets,
            'sold_tickets', sold_tickets,
            'discounted_tickets', discounted_tickets_count,
            'avg_discount_price', ROUND(avg_discounted_price::NUMERIC, 2),
            'recommendation', CASE 
                WHEN available_tickets > sold_tickets * 0.5 
                THEN 'Razmislite o agresivnijim special offers'
                WHEN discounted_tickets_count > sold_tickets * 0.3
                THEN 'Previše popusta - možda smanjiti discount vrednosti'
                ELSE 'Pricing strategija izgleda balansirana'
            END
        )::JSONB
    FROM optimization_data;

    RETURN;
END;
$$ LANGUAGE plpgsql;