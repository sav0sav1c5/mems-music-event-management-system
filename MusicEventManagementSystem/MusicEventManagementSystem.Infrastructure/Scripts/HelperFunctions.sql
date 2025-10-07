-- ============================================
-- 1.2. SALES ANALYSIS: HELPER FUNKCIJE ZA EXPORT
-- ============================================

-- Funkcija za export u CSV format (vraća text)
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
