-- Izračunavanje ukupnih troškova svih završenih pregovora za određeni event

-- Brisanje postojeće funkcije ako postoji
DROP FUNCTION IF EXISTS izracunaj_ukupne_troskove_eventa(INTEGER);

-- Kreiranje PL/pgSQL funkcije za izračunavanje ukupnih troškova eventa
CREATE OR REPLACE FUNCTION izracunaj_ukupne_troskove_eventa(p_event_id INTEGER)
RETURNS NUMERIC(12,2)
LANGUAGE plpgsql
AS $$
DECLARE
    ukupni_troskovi NUMERIC(12,2) := 0.00;
    broj_negotiation INTEGER := 0;
    prosecni_trosak NUMERIC(12,2) := 0.00;
BEGIN
    -- Izračunavanje ukupnih troškova svih završenih pregovora za specificirani event
    -- Sumiranje ProposedFee iz pregovora tabele za završene pregovore
    SELECT 
        COALESCE(SUM(n."ProposedFee"), 0.00),
        COUNT(*),
        COALESCE(AVG(n."ProposedFee"), 0.00)
    INTO ukupni_troskovi, broj_negotiation, prosecni_trosak
    FROM "Negotiations" n
    WHERE n."EventId" = p_event_id
      AND n."Status" IN ('Completed', 'Accepted')
      AND n."ProposedFee" IS NOT NULL;
    
    -- Log poruka za debugging
    RAISE NOTICE 'Event ID %: Ukupni troškovi = % RSD, Broj negotiations = %, Prosečni trošak = % RSD', 
        p_event_id, ukupni_troskovi, broj_negotiation, prosecni_trosak;
    
    -- Vraćanje izračunatih ukupnih troškova
    RETURN ukupni_troskovi;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Greška pri izračunavanju troškova za event ID %: %', p_event_id, SQLERRM;
        RETURN 0.00;
END;
$$;



-- Verifikacija da je funkcija kreirana uspešno
SELECT 'Funkcija izracunaj_ukupne_troskove_eventa kreirana uspešno!' AS status;


-- Izračunavanje troškova za event ID 1
SELECT 'Test 1: Ukupni troškovi za event ID 1' AS test_opis;
SELECT izracunaj_ukupne_troskove_eventa(1) AS ukupni_troskovi_event_1;
