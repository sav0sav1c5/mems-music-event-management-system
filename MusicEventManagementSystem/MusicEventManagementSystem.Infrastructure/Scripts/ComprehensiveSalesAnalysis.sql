-- ============================================
-- COMPREHENSIVE TICKET SALES ANALYSIS SYSTEM
-- Music Event Management System
-- 
-- Contents:
-- 1. COMPLEX PL/SQL TYPES
-- 2. SQL INDEXES (with performance demonstration)
-- 3. PL/SQL TRIGGER
-- 4. COMPLEX PL/SQL FUNCTION with explicit cursor
-- ============================================

-- ============================================
-- 1. COMPLEX PL/SQL TYPES DEFINITION
-- ============================================

-- Type for zone analysis
CREATE TYPE zone_analysis_type AS (
    zone_id INTEGER,
    zone_name VARCHAR(200),
    total_revenue DECIMAL(18,2),
    tickets_sold INTEGER,
    avg_price DECIMAL(18,2),
    base_price DECIMAL(18,2),
    occupancy_rate DECIMAL(5,2),
    price_variance DECIMAL(5,2)
);

-- Type for sales metric
CREATE TYPE sales_metric_type AS (
    metric_name VARCHAR(200),
    metric_value DECIMAL(18,2),
    metric_unit VARCHAR(50),
    timestamp TIMESTAMP
);

-- Type for offer effectiveness
CREATE TYPE offer_effectiveness_type AS (
    offer_id INTEGER,
    offer_name VARCHAR(200),
    total_revenue DECIMAL(18,2),
    tickets_affected INTEGER,
    avg_discount_pct DECIMAL(5,2),
    roi DECIMAL(8,2)
);

-- Type for pricing rule analysis
CREATE TYPE pricing_rule_analysis_type AS (
    rule_id INTEGER,
    rule_name VARCHAR(200),
    tickets_count INTEGER,
    revenue_generated DECIMAL(18,2),
    avg_price_change_pct DECIMAL(5,2)
);

-- Type for daily trend
CREATE TYPE daily_trend_type AS (
    sale_date DATE,
    tickets_sold INTEGER,
    daily_revenue DECIMAL(18,2),
    cumulative_revenue DECIMAL(18,2)
);

-- ============================================
-- 2. INDEX CREATION FOR OPTIMIZATION
-- ============================================

-- Index for faster filtering by sale date
CREATE INDEX IF NOT EXISTS idx_recordedsales_saledate 
ON "RecordedSales"("SaleDate");

-- Composite index for JOIN between Tickets and RecordedSales
CREATE INDEX IF NOT EXISTS idx_tickets_recordedsale_tickettype
ON "Tickets"("RecordedSaleId", "TicketTypeId")
WHERE "RecordedSaleId" IS NOT NULL;

-- Index for faster connection of TicketTypes with Events
CREATE INDEX IF NOT EXISTS idx_tickettypes_eventid_zoneid
ON "TicketTypes"("EventId", "ZoneId");

-- Index for ticket status
CREATE INDEX IF NOT EXISTS idx_tickets_status
ON "Tickets"("Status");

-- Index for Special Offers validity period
CREATE INDEX IF NOT EXISTS idx_specialoffers_dates
ON "SpecialOffers"("StartDate", "EndDate");

-- ============================================
-- INDEX PERFORMANCE DEMONSTRATION
-- ============================================

-- Function for testing query performance
CREATE OR REPLACE FUNCTION demonstrate_index_performance()
RETURNS TABLE (
    test_name VARCHAR(100),
    execution_time_ms NUMERIC,
    rows_returned BIGINT,
    index_used BOOLEAN
) AS $$
DECLARE
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_row_count BIGINT;
BEGIN
    -- Test 1: Query WITH index
    v_start_time := clock_timestamp();
    
    SELECT COUNT(*) INTO v_row_count
    FROM "RecordedSales" rs
    WHERE rs."SaleDate" >= CURRENT_DATE - INTERVAL '30 days';
    
    v_end_time := clock_timestamp();
    
    RETURN QUERY
    SELECT 
        'Test 1: Date filtering (WITH index)'::VARCHAR(100),
        EXTRACT(MILLISECONDS FROM (v_end_time - v_start_time))::NUMERIC,
        v_row_count,
        TRUE;
    
    -- Test 2: Complex JOIN with indexes
    v_start_time := clock_timestamp();
    
    SELECT COUNT(*) INTO v_row_count
    FROM "Tickets" t
    JOIN "RecordedSales" rs ON t."RecordedSaleId" = rs."RecordedSaleId"
    JOIN "TicketTypes" tt ON t."TicketTypeId" = tt."TicketTypeId"
    WHERE rs."SaleDate" >= CURRENT_DATE - INTERVAL '30 days'
        AND t."RecordedSaleId" IS NOT NULL;
    
    v_end_time := clock_timestamp();
    
    RETURN QUERY
    SELECT 
        'Test 2: Complex JOIN (WITH indexes)'::VARCHAR(100),
        EXTRACT(MILLISECONDS FROM (v_end_time - v_start_time))::NUMERIC,
        v_row_count,
        TRUE;
    
    -- Test 3: Aggregation with GROUP BY
    v_start_time := clock_timestamp();
    
    SELECT COUNT(*) INTO v_row_count
    FROM (
        SELECT tt."EventId", COUNT(*)
        FROM "Tickets" t
        JOIN "TicketTypes" tt ON t."TicketTypeId" = tt."TicketTypeId"
        WHERE t."RecordedSaleId" IS NOT NULL
        GROUP BY tt."EventId"
    ) subq;
    
    v_end_time := clock_timestamp();
    
    RETURN QUERY
    SELECT 
        'Test 3: Aggregation by Events (WITH index)'::VARCHAR(100),
        EXTRACT(MILLISECONDS FROM (v_end_time - v_start_time))::NUMERIC,
        v_row_count,
        TRUE;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. TRIGGER FOR AUTOMATIC VALIDATION AND AUDIT
-- ============================================

-- Audit log table (if not exists)
CREATE TABLE IF NOT EXISTS "SalesAuditLog" (
    "AuditId" SERIAL PRIMARY KEY,
    "RecordedSaleId" INTEGER,
    "Action" VARCHAR(50),
    "OldTotalAmount" DECIMAL(18,2),
    "NewTotalAmount" DECIMAL(18,2),
    "TicketCount" INTEGER,
    "ChangedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "ChangedBy" VARCHAR(100)
);

-- Trigger function for validation and audit
CREATE OR REPLACE FUNCTION trg_validate_and_audit_sale()
RETURNS TRIGGER AS $$
DECLARE
    v_calculated_total DECIMAL(18,2);
    v_ticket_count INTEGER;
    v_event_date TIMESTAMP;
    v_min_price DECIMAL(18,2);
BEGIN
    -- INSERT operation
    IF TG_OP = 'INSERT' THEN
        -- Validation: TotalAmount cannot be negative
        IF NEW."TotalAmount" < 0 THEN
            RAISE EXCEPTION 'TotalAmount cannot be negative: %', NEW."TotalAmount";
        END IF;
        
        -- Validation: SaleDate cannot be in the future
        IF NEW."SaleDate" AT TIME ZONE 'UTC' > CURRENT_TIMESTAMP AT TIME ZONE 'UTC' THEN
            RAISE EXCEPTION 'SaleDate cannot be in the future: %', NEW."SaleDate";
        END IF;
        
        -- Log operation
        INSERT INTO "SalesAuditLog" (
            "RecordedSaleId", "Action", "OldTotalAmount", 
            "NewTotalAmount", "TicketCount", "ChangedBy"
        ) VALUES (
            NEW."RecordedSaleId", 'INSERT', NULL, 
            NEW."TotalAmount", 0, CURRENT_USER
        );
        
        RETURN NEW;
    END IF;
    
    -- UPDATE operation
    IF TG_OP = 'UPDATE' THEN
        -- Check if TotalAmount changed
        IF OLD."TotalAmount" <> NEW."TotalAmount" THEN
            -- Calculate actual total from related tickets
            SELECT 
                COALESCE(SUM(t."FinalPrice"), 0),
                COUNT(*)
            INTO v_calculated_total, v_ticket_count
            FROM "Tickets" t
            WHERE t."RecordedSaleId" = NEW."RecordedSaleId";
            
            -- Warning if differs from calculated
            IF ABS(NEW."TotalAmount" - v_calculated_total) > 0.01 THEN
                RAISE WARNING 'TotalAmount (%) differs from calculated (%) for RecordedSaleId %',
                    NEW."TotalAmount", v_calculated_total, NEW."RecordedSaleId";
            END IF;
            
            -- Audit log
            INSERT INTO "SalesAuditLog" (
                "RecordedSaleId", "Action", "OldTotalAmount", 
                "NewTotalAmount", "TicketCount", "ChangedBy"
            ) VALUES (
                NEW."RecordedSaleId", 'UPDATE', OLD."TotalAmount", 
                NEW."TotalAmount", v_ticket_count, CURRENT_USER
            );
        END IF;
        
        RETURN NEW;
    END IF;
    
    -- DELETE operation
    IF TG_OP = 'DELETE' THEN
        -- Check if there are related tickets
        SELECT COUNT(*) INTO v_ticket_count
        FROM "Tickets" t
        WHERE t."RecordedSaleId" = OLD."RecordedSaleId";
        
        IF v_ticket_count > 0 THEN
            RAISE EXCEPTION 'Cannot delete RecordedSale % because it has % related tickets',
                OLD."RecordedSaleId", v_ticket_count;
        END IF;
        
        -- Audit log
        INSERT INTO "SalesAuditLog" (
            "RecordedSaleId", "Action", "OldTotalAmount", 
            "NewTotalAmount", "TicketCount", "ChangedBy"
        ) VALUES (
            OLD."RecordedSaleId", 'DELETE', OLD."TotalAmount", 
            NULL, 0, CURRENT_USER
        );
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trg_sales_validation_audit ON "RecordedSales";
CREATE TRIGGER trg_sales_validation_audit
    BEFORE INSERT OR UPDATE OR DELETE ON "RecordedSales"
    FOR EACH ROW
    EXECUTE FUNCTION trg_validate_and_audit_sale();

-- ============================================
-- 4. COMPLEX FUNCTION WITH EXPLICIT CURSOR
-- ============================================

CREATE OR REPLACE FUNCTION sp_comprehensive_sales_analysis_v2(
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
    -- Explicit cursor declaration for zone analysis
    zone_cursor CURSOR FOR
        SELECT 
            z."ZoneId",
            z."Name",
            z."BasePrice",
            z."Position",
            z."Capacity",
            COALESCE(SUM(t."FinalPrice"), 0) AS total_revenue,
            COUNT(t."TicketId") AS tickets_sold,
            COALESCE(AVG(t."FinalPrice"), 0) AS avg_price
        FROM "Zones" z
        JOIN "TicketTypes" tt ON z."ZoneId" = tt."ZoneId"
        INNER JOIN "Tickets" t ON tt."TicketTypeId" = t."TicketTypeId" 
        INNER JOIN "RecordedSales" rs ON t."RecordedSaleId" = rs."RecordedSaleId"
        WHERE rs."SaleDate" BETWEEN p_start_date AND p_end_date
            AND t."RecordedSaleId" IS NOT NULL
            AND (p_event_id IS NULL OR tt."EventId" = p_event_id)
        GROUP BY z."ZoneId", z."Name", z."BasePrice", z."Position", z."Capacity"
        HAVING COUNT(t."TicketId") > 0
        ORDER BY COALESCE(SUM(t."FinalPrice"), 0) DESC;
    
    -- Cursor for pricing rules
    pricing_cursor CURSOR FOR
        SELECT 
            pr."PricingRuleId",
            pr."Name",
            COUNT(DISTINCT t."TicketId") AS tickets_affected,
            COALESCE(SUM(t."FinalPrice"), 0) AS revenue,
            COALESCE(AVG(
                CASE 
                    WHEN z."BasePrice" > 0 THEN 
                        ((t."FinalPrice" - z."BasePrice") / z."BasePrice" * 100)
                    ELSE 0
                END
            ), 0) AS avg_price_change_pct
        FROM "PricingRules" pr
        JOIN "TicketTypePricingRules" prtt ON pr."PricingRuleId" = prtt."PricingRulesPricingRuleId"
        JOIN "TicketTypes" tt ON prtt."TicketTypesTicketTypeId" = tt."TicketTypeId"
        JOIN "Zones" z ON tt."ZoneId" = z."ZoneId"
        INNER JOIN "Tickets" t ON tt."TicketTypeId" = t."TicketTypeId"
        INNER JOIN "RecordedSales" rs ON t."RecordedSaleId" = rs."RecordedSaleId"
        WHERE rs."SaleDate" BETWEEN p_start_date AND p_end_date
            AND t."RecordedSaleId" IS NOT NULL
            AND (p_event_id IS NULL OR tt."EventId" = p_event_id)
        GROUP BY pr."PricingRuleId", pr."Name"
        HAVING COUNT(DISTINCT t."TicketId") > 0
        ORDER BY COALESCE(SUM(t."FinalPrice"), 0) DESC;
    
    -- Processing variables
    v_zone_record RECORD;
    v_pricing_record RECORD;
    v_total_revenue DECIMAL(18,2);
    v_total_tickets_sold INTEGER;
    v_zone_count INTEGER := 0;
    v_pricing_count INTEGER := 0;
BEGIN
    -- Set default values
    p_start_date := COALESCE(p_start_date, CURRENT_TIMESTAMP - INTERVAL '30 days');
    p_end_date := COALESCE(p_end_date, CURRENT_TIMESTAMP);

    -- ===========================================
    -- SECTION 1: BASIC METRICS
    -- ===========================================
    
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
        'BASIC_METRICS'::VARCHAR(100),
        'Total Revenue'::VARCHAR(200),
        v_total_revenue::DECIMAL(18,2),
        'RSD'::VARCHAR(50),
        jsonb_build_object(
            'period_start', p_start_date,
            'period_end', p_end_date
        )::JSONB;

    SELECT COUNT(DISTINCT t."TicketId")::INTEGER
    INTO v_total_tickets_sold
    FROM "Tickets" t
    JOIN "TicketTypes" tt ON t."TicketTypeId" = tt."TicketTypeId"
    JOIN "RecordedSales" rs ON t."RecordedSaleId" = rs."RecordedSaleId"
    WHERE rs."SaleDate" BETWEEN p_start_date AND p_end_date
        AND t."RecordedSaleId" IS NOT NULL
        AND (p_event_id IS NULL OR tt."EventId" = p_event_id);
    
    RETURN QUERY
    SELECT 
        'BASIC_METRICS'::VARCHAR(100),
        'Total Tickets Sold'::VARCHAR(200),
        v_total_tickets_sold::DECIMAL(18,2),
        'pcs'::VARCHAR(50),
        NULL::JSONB;

    RETURN QUERY
    SELECT 
        'BASIC_METRICS'::VARCHAR(100),
        'Average Ticket Price'::VARCHAR(200),
        CASE WHEN v_total_tickets_sold > 0 
            THEN (v_total_revenue / v_total_tickets_sold)::DECIMAL(18,2)
            ELSE 0::DECIMAL(18,2)
        END,
        'RSD'::VARCHAR(50),
        NULL::JSONB;

    -- ===========================================
    -- SECTION 2: ZONE ANALYSIS (EXPLICIT CURSOR)
    -- ===========================================
    
    -- Open cursor for zones
    OPEN zone_cursor;
    
    LOOP
        FETCH zone_cursor INTO v_zone_record;
        EXIT WHEN NOT FOUND;
        
        v_zone_count := v_zone_count + 1;
        
        -- Generate result for each zone using cursor data
        RETURN QUERY
        SELECT 
            'ZONE_ANALYSIS'::VARCHAR(100),
            ('Zone: ' || COALESCE(v_zone_record."Name", 'N/A'))::VARCHAR(200),
            v_zone_record.total_revenue::DECIMAL(18,2),
            'RSD'::VARCHAR(50),
            jsonb_build_object(
                'zone_id', v_zone_record."ZoneId",
                'tickets_sold', v_zone_record.tickets_sold,
                'avg_price', ROUND(v_zone_record.avg_price::NUMERIC, 2),
                'base_price', v_zone_record."BasePrice",
                'price_variance', ROUND(
                    CASE 
                        WHEN v_zone_record."BasePrice" > 0 THEN 
                            ((v_zone_record.avg_price - v_zone_record."BasePrice") / 
                             v_zone_record."BasePrice" * 100)::NUMERIC
                        ELSE 0::NUMERIC
                    END, 2
                ),
                'occupancy_rate', ROUND(
                    CASE 
                        WHEN v_zone_record."Capacity" > 0 THEN 
                            (v_zone_record.tickets_sold::NUMERIC / v_zone_record."Capacity" * 100)
                        ELSE 0::NUMERIC
                    END, 2
                ),
                'position', v_zone_record."Position",
                'zone_rank', v_zone_count
            )::JSONB;
    END LOOP;
    
    -- Close cursor
    CLOSE zone_cursor;

    -- ===========================================
    -- SECTION 3: PRICING RULES (EXPLICIT CURSOR)
    -- ===========================================
    
    -- Open cursor for pricing rules
    OPEN pricing_cursor;
    
    LOOP
        FETCH pricing_cursor INTO v_pricing_record;
        EXIT WHEN NOT FOUND;
        
        v_pricing_count := v_pricing_count + 1;
        
        RETURN QUERY
        SELECT 
            'PRICING_RULES_EFFICIENCY'::VARCHAR(100),
            ('Rule: ' || COALESCE(v_pricing_record."Name", 'N/A'))::VARCHAR(200),
            v_pricing_record.revenue::DECIMAL(18,2),
            'RSD'::VARCHAR(50),
            jsonb_build_object(
                'pricing_rule_id', v_pricing_record."PricingRuleId",
                'tickets_affected', v_pricing_record.tickets_affected,
                'avg_price_change_pct', ROUND(v_pricing_record.avg_price_change_pct::NUMERIC, 2),
                'revenue_per_ticket', ROUND(
                    CASE 
                        WHEN v_pricing_record.tickets_affected > 0 THEN 
                            (v_pricing_record.revenue / v_pricing_record.tickets_affected)::NUMERIC
                        ELSE 0::NUMERIC
                    END, 2
                ),
                'rule_rank', v_pricing_count
            )::JSONB;
    END LOOP;
    
    -- Close cursor
    CLOSE pricing_cursor;

    -- ===========================================
    -- SECTION 4: SPECIAL OFFERS PERFORMANCE
    -- ===========================================
    
    RETURN QUERY
    SELECT 
        'SPECIAL_OFFERS_PERFORMANCE'::VARCHAR(100),
        ('Offer: ' || COALESCE(so."Name", 'N/A'))::VARCHAR(200),
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
    INNER JOIN "Tickets" t ON tt."TicketTypeId" = t."TicketTypeId"
    INNER JOIN "RecordedSales" rs ON t."RecordedSaleId" = rs."RecordedSaleId"
    WHERE rs."SaleDate" BETWEEN p_start_date AND p_end_date
        AND t."RecordedSaleId" IS NOT NULL
        AND so."StartDate" <= p_end_date
        AND so."EndDate" >= p_start_date
        AND (p_event_id IS NULL OR tt."EventId" = p_event_id)
    GROUP BY so."SpecialOfferId", so."Name", so."OfferType", so."DiscountValue"
    HAVING COUNT(DISTINCT t."TicketId") > 0
    ORDER BY COALESCE(SUM(t."FinalPrice"), 0) DESC;

    -- ===========================================
    -- SECTION 5: TREND ANALYSIS
    -- ===========================================
    
    RETURN QUERY
    WITH daily_sales AS (
        SELECT 
            DATE(rs."SaleDate") AS sale_date,
            COUNT(DISTINCT t."TicketId")::INTEGER AS tickets_sold,
            SUM(t."FinalPrice")::DECIMAL(18,2) AS daily_revenue
        FROM "RecordedSales" rs
        JOIN "Tickets" t ON rs."RecordedSaleId" = t."RecordedSaleId"
        JOIN "TicketTypes" tt ON t."TicketTypeId" = tt."TicketTypeId"
        WHERE rs."SaleDate" BETWEEN p_start_date AND p_end_date
            AND t."RecordedSaleId" IS NOT NULL
            AND (p_event_id IS NULL OR tt."EventId" = p_event_id)
        GROUP BY DATE(rs."SaleDate")
    )
    SELECT 
        'TREND_ANALYSIS'::VARCHAR(100),
        'Average Daily Sales'::VARCHAR(200),
        COALESCE(AVG(tickets_sold), 0)::DECIMAL(18,2),
        'tickets/day'::VARCHAR(50),
        jsonb_build_object(
            'stddev', ROUND(COALESCE(STDDEV(tickets_sold), 0)::NUMERIC, 2),
            'peak', COALESCE(MAX(tickets_sold), 0),
            'min', COALESCE(MIN(tickets_sold), 0),
            'avg_revenue_per_day', ROUND(COALESCE(AVG(daily_revenue), 0)::NUMERIC, 2),
            'total_days', COUNT(*)
        )::JSONB
    FROM daily_sales;

    -- ===========================================
    -- SECTION 6: EVENT PERFORMANCE COMPARISON
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
        INNER JOIN "Tickets" t ON tt."TicketTypeId" = t."TicketTypeId" 
        INNER JOIN "RecordedSales" rs ON t."RecordedSaleId" = rs."RecordedSaleId"
        WHERE rs."SaleDate" BETWEEN p_start_date AND p_end_date
            AND t."RecordedSaleId" IS NOT NULL
        GROUP BY e."Id", e."Name", e."Status"
        HAVING COUNT(DISTINCT t."TicketId") > 0
        ORDER BY COALESCE(SUM(t."FinalPrice"), 0) DESC;
    END IF;

    -- ===========================================
    -- SECTION 7: REVENUE OPTIMIZATION INSIGHTS
    -- ===========================================
    
    RETURN QUERY
    WITH optimization_data AS (
        SELECT 
            COUNT(*) FILTER (WHERE t."Status" = 0 AND t."RecordedSaleId" IS NULL)::INTEGER AS available_tickets,
            COUNT(*) FILTER (WHERE t."RecordedSaleId" IS NOT NULL)::INTEGER AS sold_tickets,
            COALESCE(SUM(z."BasePrice") FILTER (WHERE t."Status" = 0 AND t."RecordedSaleId" IS NULL), 0)::DECIMAL(18,2) AS potential_revenue_lost,
            COALESCE(AVG(t."FinalPrice") FILTER (WHERE t."FinalPrice" < z."BasePrice" AND t."RecordedSaleId" IS NOT NULL), 0)::DECIMAL(18,2) AS avg_discounted_price,
            COUNT(*) FILTER (WHERE t."FinalPrice" < z."BasePrice" AND t."RecordedSaleId" IS NOT NULL)::INTEGER AS discounted_tickets_count
        FROM "TicketTypes" tt
        JOIN "Zones" z ON tt."ZoneId" = z."ZoneId"
        LEFT JOIN "Tickets" t ON tt."TicketTypeId" = t."TicketTypeId"
        WHERE (p_event_id IS NULL OR tt."EventId" = p_event_id)
    )
    SELECT 
        'REVENUE_OPTIMIZATION'::VARCHAR(100),
        'Potential Lost Revenue'::VARCHAR(200),
        potential_revenue_lost::DECIMAL(18,2),
        'RSD'::VARCHAR(50),
        jsonb_build_object(
            'available_tickets', available_tickets,
            'sold_tickets', sold_tickets,
            'discounted_tickets', discounted_tickets_count,
            'avg_discount_price', ROUND(avg_discounted_price::NUMERIC, 2),
            'sell_through_rate', ROUND(
                CASE 
                    WHEN (sold_tickets + available_tickets) > 0 THEN 
                        (sold_tickets::NUMERIC / (sold_tickets + available_tickets) * 100)
                    ELSE 0::NUMERIC
                END, 2
            ),
            'recommendation', CASE 
                WHEN available_tickets > sold_tickets * 0.5 
                THEN 'Consider more aggressive special offers'
                WHEN discounted_tickets_count > sold_tickets * 0.3
                THEN 'Too many discounts - consider reducing discount values'
                ELSE 'Pricing strategy appears balanced'
            END
        )::JSONB
    FROM optimization_data;

    -- ===========================================
    -- SECTION 8: CURSOR STATISTICS
    -- ===========================================
    
    RETURN QUERY
    SELECT 
        'CURSOR_STATISTICS'::VARCHAR(100),
        'Results Processed by Cursors'::VARCHAR(200),
        (v_zone_count + v_pricing_count)::DECIMAL(18,2),
        'rows'::VARCHAR(50),
        jsonb_build_object(
            'zones_processed', v_zone_count,
            'pricing_rules_processed', v_pricing_count,
            'cursor_method', 'Explicit CURSOR with LOOP'
        )::JSONB;

    RETURN;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- HELPER FUNCTIONS FOR TESTING
-- ============================================

-- Function to display audit log
CREATE OR REPLACE FUNCTION get_sales_audit_log(
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    audit_id INTEGER,
    recorded_sale_id INTEGER,
    action VARCHAR(50),
    old_amount DECIMAL(18,2),
    new_amount DECIMAL(18,2),
    ticket_count INTEGER,
    changed_at TIMESTAMP,
    changed_by VARCHAR(100)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        "AuditId",
        "RecordedSaleId",
        "Action",
        "OldTotalAmount",
        "NewTotalAmount",
        "TicketCount",
        "ChangedAt",
        "ChangedBy"
    FROM "SalesAuditLog"
    ORDER BY "ChangedAt" DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- EXAMPLES OF FUNCTION CALLS
-- ============================================

/*
-- Main function call with all parameters:
SELECT * FROM sp_comprehensive_sales_analysis_v2(
    p_event_id := 1,
    p_start_date := '2024-01-01'::TIMESTAMP,
    p_end_date := '2024-12-31'::TIMESTAMP
);

-- Call without parameters (last 30 days):
SELECT * FROM sp_comprehensive_sales_analysis_v2();

-- Index performance testing:
SELECT * FROM demonstrate_index_performance();

-- Overview of the audit log:
SELECT * FROM get_sales_audit_log(100);

-- EXPLAIN ANALYZE to check index usage:
EXPLAIN ANALYZE
SELECT * FROM sp_comprehensive_sales_analysis_v2(NULL, CURRENT_DATE - 30, CURRENT_DATE);
*/