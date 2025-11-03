-- ============================================================================
-- KOMPLEKSAN IZVEŠTAJ - ANALIZA PREGOVORA SA PERFORMERIMA
-- ============================================================================
-- Datum: 21. oktobar 2025
-- Svrha: Kompleksna analiza pregovora grupisana po eventima, performerima i fazama
--        Koristi: PL/SQL tipove, kursore, složene SQL upite, WITH klauzulu,
--        GROUP BY, HAVING, agregacione funkcije (SUM, COUNT)

-- ============================================================================
-- KREIRANJE SLOŽENIH PL/SQL TIPOVA
-- ============================================================================

-- Brisanje postojećih tipova
DROP TYPE IF EXISTS negotiation_summary_record CASCADE;
DROP TYPE IF EXISTS event_performer_stats_record CASCADE;

-- Tip za čuvanje sažetka pregovora po eventu
CREATE TYPE negotiation_summary_record AS (
    event_id INTEGER,
    event_name VARCHAR(200),
    event_date DATE,
    ukupno_pregovora INTEGER,
    uspesno_zavrsenih INTEGER,
    ukupna_vrednost NUMERIC(12,2),
    prosecna_vrednost NUMERIC(12,2),
    broj_performera INTEGER
);

-- Tip za čuvanje statistike pregovora po performeru i fazi
CREATE TYPE event_performer_stats_record AS (
    performer_id INTEGER,
    performer_name VARCHAR(200),
    zanr VARCHAR(100),
    trenutna_faza INTEGER,
    broj_pregovora INTEGER,
    broj_evenata INTEGER,
    ukupna_ponudjena_cena NUMERIC(12,2),
    prosecna_ponudjena_cena NUMERIC(12,2),
    min_cena NUMERIC(12,2),
    max_cena NUMERIC(12,2),
    zavrsenih INTEGER,
    u_toku INTEGER
);

SELECT 'Složeni PL/SQL tipovi uspešno kreirani!' AS status;

-- FUNKCIJA: GENERISANJE IZVEŠTAJA O PREGOVORIMA PO EVENTIMA
-- ============================================================================
-- Koristi: Kursor, kompozitni tip, CTE, GROUP BY, HAVING, agregacije

CREATE OR REPLACE FUNCTION generate_event_negotiations_report()
RETURNS SETOF negotiation_summary_record
LANGUAGE plpgsql
AS $$
DECLARE
    -- Kursor za iteraciju kroz sve evente sa pregovorima
    event_cursor CURSOR FOR
        SELECT 
            e."Id" AS event_id,
            e."Name" AS event_name,
            e."Interval"::DATE AS event_date
        FROM "Events" e
        WHERE EXISTS (
            SELECT 1 FROM "Negotiations" n WHERE n."EventId" = e."Id"
        )
        ORDER BY e."Interval" DESC;
    
    -- Promenljive za trenutni event
    current_event RECORD;
    report_row negotiation_summary_record;
    
    -- Promenljive za kalkulacije
    total_negotiations INTEGER;
    completed_negotiations INTEGER;
    total_value NUMERIC(12,2);
    avg_value NUMERIC(12,2);
    performer_count INTEGER;
    
BEGIN
    -- Otvaranje kursora
    OPEN event_cursor;
    
    LOOP
        FETCH event_cursor INTO current_event;
        EXIT WHEN NOT FOUND;
        
        -- Kompleksan upit sa CTE za izračunavanje metrika
        WITH event_negotiations AS (
            SELECT 
                COUNT(n."NegotiationId") AS ukupno_pregovora,
                COUNT(CASE WHEN n."Status" = 'Completed' THEN 1 END) AS uspesno_zavrsenih,
                COALESCE(SUM(n."ProposedFee"), 0) AS ukupna_vrednost,
                COALESCE(AVG(n."ProposedFee"), 0) AS prosecna_vrednost,
                COUNT(DISTINCT n."PerformerId") AS broj_performera
            FROM "Negotiations" n
            WHERE n."EventId" = current_event.event_id
        )
        SELECT 
            ukupno_pregovora,
            uspesno_zavrsenih,
            ukupna_vrednost,
            prosecna_vrednost,
            broj_performera
        INTO 
            total_negotiations,
            completed_negotiations,
            total_value,
            avg_value,
            performer_count
        FROM event_negotiations;
        
        -- Popunjavanje reda izveštaja (kompozitni tip)
        report_row.event_id := current_event.event_id;
        report_row.event_name := current_event.event_name;
        report_row.event_date := current_event.event_date;
        report_row.ukupno_pregovora := total_negotiations;
        report_row.uspesno_zavrsenih := completed_negotiations;
        report_row.ukupna_vrednost := total_value;
        report_row.prosecna_vrednost := avg_value;
        report_row.broj_performera := performer_count;
        
        -- Vraćanje reda
        RETURN NEXT report_row;
        
    END LOOP;
    
    CLOSE event_cursor;
    
    RETURN;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Zatvori kursor ako je otvoren
        IF event_cursor%ISOPEN THEN
            CLOSE event_cursor;
        END IF;
        
        RETURN;
END;
$$;

-- FUNKCIJA: GENERISANJE IZVEŠTAJA O PREGOVORIMA PO PERFORMERIMA I FAZAMA
-- ============================================================================
-- Koristi: Kursor, kompozitni tip, CTE, JOIN 3+ tabele, GROUP BY, HAVING

CREATE OR REPLACE FUNCTION generate_performer_phase_report()
RETURNS SETOF event_performer_stats_record
LANGUAGE plpgsql
AS $$
DECLARE
    -- Kursor za iteraciju kroz agregirane podatke po performer-faza
    performer_cursor CURSOR FOR
        SELECT 
            p."PerformerId" AS performer_id,
            p."Name" AS performer_name,
            p."Genre" AS zanr,
            n."CurrentPhaseOrder" AS trenutna_faza,
            COUNT(n."NegotiationId") AS broj_pregovora,
            COUNT(DISTINCT n."EventId") AS broj_evenata,
            SUM(n."ProposedFee") AS ukupna_cena,
            AVG(n."ProposedFee") AS prosecna_cena,
            MIN(n."ProposedFee") AS min_cena,
            MAX(n."ProposedFee") AS max_cena,
            COUNT(CASE WHEN n."Status" = 'Completed' THEN 1 END) AS zavrsenih,
            COUNT(CASE WHEN n."Status" = 'InProgress' THEN 1 END) AS u_toku
        FROM "Performers" p
        INNER JOIN "Negotiations" n ON p."PerformerId" = n."PerformerId"
        INNER JOIN "Events" e ON n."EventId" = e."Id"
        WHERE n."ProposedFee" > 0
        GROUP BY p."PerformerId", p."Name", p."Genre", n."CurrentPhaseOrder"
        HAVING COUNT(n."NegotiationId") >= 1
        ORDER BY p."Name", n."CurrentPhaseOrder";
    
    -- Promenljiva za trenutni red podataka
    current_row RECORD;
    report_row event_performer_stats_record;
    
BEGIN
    -- Otvaranje kursora
    OPEN performer_cursor;
    
    LOOP
        FETCH performer_cursor INTO current_row;
        EXIT WHEN NOT FOUND;
        
        -- Popunjavanje reda izveštaja direktno iz kursora
        report_row.performer_id := current_row.performer_id;
        report_row.performer_name := current_row.performer_name;
        report_row.zanr := current_row.zanr;
        report_row.trenutna_faza := current_row.trenutna_faza;
        report_row.broj_pregovora := current_row.broj_pregovora;
        report_row.broj_evenata := current_row.broj_evenata;
        report_row.ukupna_ponudjena_cena := current_row.ukupna_cena;
        report_row.prosecna_ponudjena_cena := current_row.prosecna_cena;
        report_row.min_cena := current_row.min_cena;
        report_row.max_cena := current_row.max_cena;
        report_row.zavrsenih := current_row.zavrsenih;
        report_row.u_toku := current_row.u_toku;
        
        -- Vraćanje reda
        RETURN NEXT report_row;
        
    END LOOP;
    
    CLOSE performer_cursor;
    
    RETURN;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Zatvori kursor ako je otvoren
        IF performer_cursor%ISOPEN THEN
            CLOSE performer_cursor;
        END IF;
        
        RETURN;
END;
$$;

SELECT 'Funkcije za generisanje izveštaja uspešno kreirane!' AS status;

-- PROCEDURA: PRIKAZ KOMPLETNOG IZVEŠTAJA 
-- ============================================================================
-- Ova procedura poziva obe funkcije i prikazuje oba dela izveštaja u jednom pozivu

CREATE OR REPLACE PROCEDURE generate_complete_negotiations_report()
LANGUAGE plpgsql
AS $$
DECLARE
    event_rec RECORD;
    performer_rec RECORD;
BEGIN
    -- Deo 1: Izveštaj po eventima
    RAISE NOTICE '';
    RAISE NOTICE '╔════════════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║     IZVEŠTAJ O PREGOVORIMA PO EVENTIMA                         ║';
    RAISE NOTICE '╚════════════════════════════════════════════════════════════════╝';
    RAISE NOTICE '';
    
    RAISE NOTICE 'Event ID | Naziv Eventa | Datum | Ukupno | Završenih | Ukupna Vrednost | Prosečna Vrednost | Broj Performera';
    RAISE NOTICE '---------|--------------|-------|--------|-----------|-----------------|-------------------|----------------';
    
    -- Iteracija kroz prvi izveštaj
    FOR event_rec IN 
        SELECT * FROM generate_event_negotiations_report() 
        ORDER BY ukupna_vrednost DESC
    LOOP
        RAISE NOTICE '% | % | % | % | % | % RSD | % RSD | %',
            event_rec.event_id,
            event_rec.event_name,
            event_rec.event_date,
            event_rec.ukupno_pregovora,
            event_rec.uspesno_zavrsenih,
            ROUND(event_rec.ukupna_vrednost, 2),
            ROUND(event_rec.prosecna_vrednost, 2),
            event_rec.broj_performera;
    END LOOP;
    
    -- Deo 2: Izveštaj po performerima i fazama
    RAISE NOTICE '';
    RAISE NOTICE '╔════════════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║     IZVEŠTAJ O PREGOVORIMA PO PERFORMERIMA I FAZAMA           ║';
    RAISE NOTICE '╚════════════════════════════════════════════════════════════════╝';
    RAISE NOTICE '';
    
    RAISE NOTICE 'Performer ID | Performer | Žanr | Faza | Pregovora | Evenata | Završenih | U Toku | Ukupna | Prosečna | Min | Max';
    RAISE NOTICE '-------------|-----------|------|------|-----------|---------|-----------|--------|--------|----------|-----|----';
    
    -- Iteracija kroz drugi izveštaj
    FOR performer_rec IN 
        SELECT * FROM generate_performer_phase_report() 
        ORDER BY performer_name, trenutna_faza
    LOOP
        RAISE NOTICE '% | % | % | % | % | % | % | % | % | % | % | %',
            performer_rec.performer_id,
            performer_rec.performer_name,
            performer_rec.zanr,
            performer_rec.trenutna_faza,
            performer_rec.broj_pregovora,
            performer_rec.broj_evenata,
            performer_rec.zavrsenih,
            performer_rec.u_toku,
            ROUND(performer_rec.ukupna_ponudjena_cena, 2),
            ROUND(performer_rec.prosecna_ponudjena_cena, 2),
            ROUND(performer_rec.min_cena, 2),
            ROUND(performer_rec.max_cena, 2);
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Izveštaj kompletiran!';
END;
$$;
