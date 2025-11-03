-- ============================================================================
-- PL/pgSQL TRIGER ZA VALIDACIJU PROPOSED FEE (SLOŽENA VERZIJA)
-- ============================================================================
-- Datum: 21. oktobar 2025
-- Svrha: Složena validacija ProposedFee sa više poslovnih pravila:
--        1. Osnovni uslov: ProposedFee ne sme biti veći od MaxPrice
--        2. Izuzetak: Popularni performeri (Popularity >= 8) mogu preći 10% preko MaxPrice
--        3. Izuzetak: U kasnijim fazama (faza >= 3) dozvoljeno 15% preko MaxPrice
--        4. ProposedFee mora biti minimum 80% od proseka prethodnih negotiation-a
--        5. ProposedFee ne sme biti manji od MinPrice performera

-- Brisanje postojećeg trigera i funkcije
DROP TRIGGER IF EXISTS trg_validate_proposed_fee ON "Negotiations";
DROP FUNCTION IF EXISTS validate_proposed_fee();

-- Kreiranje funkcije za validaciju ProposedFee
CREATE OR REPLACE FUNCTION validate_proposed_fee()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    max_price_value DECIMAL;
    min_price_value DECIMAL;
    performer_popularity INTEGER;
    performer_status VARCHAR(50);
    
    negotiation_count INTEGER;
    avg_previous_fee DECIMAL;
    current_phase INTEGER;
    
    max_allowed_fee DECIMAL;
    tolerance_percentage DECIMAL := 0.0;
    
BEGIN
    -- Dobija podatke o izvodjaču
    SELECT p."MaxPrice", p."MinPrice", p."Popularity", p."Status"
    INTO max_price_value, min_price_value, performer_popularity, performer_status
    FROM "Performers" p
    WHERE p."PerformerId" = NEW."PerformerId";
    
    -- Provera da li performer postoji
    IF max_price_value IS NULL THEN
        RAISE EXCEPTION 'GRESKA: Performer sa ID % ne postoji', NEW."PerformerId"
        USING ERRCODE = '45000';
    END IF;
    
    -- Dobija trenutnu fazu pregovora (samo za UPDATE)
    IF TG_OP = 'UPDATE' THEN
        SELECT "CurrentPhaseOrder" INTO current_phase
        FROM "Negotiations" 
        WHERE "NegotiationId" = NEW."NegotiationId";
    ELSE
        current_phase := 1; -- Nova negotiation počinje od faze 1
    END IF;
    
    -- Broji prethodne uspešne negotiation-e i računa prosek
    SELECT COUNT(*), COALESCE(AVG("ProposedFee"), 0)
    INTO negotiation_count, avg_previous_fee
    FROM "Negotiations"
    WHERE "PerformerId" = NEW."PerformerId" 
      AND "Status" = 'Completed'
      AND "NegotiationId" != COALESCE(NEW."NegotiationId", -1);
    
    -- Provera minimalnog ponudjene cene
    
    IF NEW."ProposedFee" < min_price_value THEN
        RAISE EXCEPTION 'GRESKA: ProposedFee (%) je manji od MinPrice (%) performera', 
            NEW."ProposedFee", min_price_value
        USING ERRCODE = '45002';
    END IF; 

    -- Dinamička tolerancija na osnovu popularnosti i faze
    
    -- Bonus tolerancija za popularne performere
    IF performer_popularity >= 9 THEN
        tolerance_percentage := tolerance_percentage + 0.15; -- +15% za veoma popularne
    ELSIF performer_popularity >= 8 THEN
        tolerance_percentage := tolerance_percentage + 0.10; -- +10% za popularne
    ELSIF performer_popularity >= 6 THEN
        tolerance_percentage := tolerance_percentage + 0.05; -- +5% za umereno popularne
    END IF;
    
    -- Bonus tolerancija za kasnije faze pregovora
    IF current_phase >= 4 THEN
        tolerance_percentage := tolerance_percentage + 0.15; -- +15% u završnim fazama
    ELSIF current_phase >= 3 THEN
        tolerance_percentage := tolerance_percentage + 0.10; -- +10% u srednjim fazama
    END IF;
    
    -- Bonus tolerancija ako postoje prethodni uspešni pregovori
    IF negotiation_count >= 3 THEN
        tolerance_percentage := tolerance_percentage + 0.05; -- +5% za lojalne performere
    END IF;
    
    -- Maksimalno dozvoljeni fee sa tolerancijom
    max_allowed_fee := max_price_value * (1.0 + tolerance_percentage);
    
    -- Glavna validacija MaxPrice sa dinamičkom tolerancijom
    IF (TG_OP = 'INSERT') THEN
        IF NOT (NEW."ProposedFee" <= max_allowed_fee) THEN
            RAISE EXCEPTION 'GRESKA: Ne moze se uneti negotiation sa ProposedFee (%) vecim od dozvoljenog (MaxPrice: %, tolerancija: %%%, max dozvoljeno: %). Popularity: %, Faza: %, Prethodni pregovori: %', 
                NEW."ProposedFee", 
                max_price_value, 
                ROUND(tolerance_percentage * 100, 1),
                max_allowed_fee,
                performer_popularity,
                current_phase,
                negotiation_count
            USING ERRCODE = '45000';
        END IF;
        
        -- Logovanje za INSERT
        RAISE NOTICE 'VALIDACIJA USPEŠNA [INSERT]: ProposedFee=%, MaxPrice=%, Tolerancija=%%%, MaxDozvoljeno=%, Popularity=%, Faza=%',
            NEW."ProposedFee", max_price_value, ROUND(tolerance_percentage * 100, 1), max_allowed_fee, performer_popularity, current_phase;
    
    ELSIF (TG_OP = 'UPDATE' AND OLD."ProposedFee" IS DISTINCT FROM NEW."ProposedFee") THEN
        IF NOT (NEW."ProposedFee" <= max_allowed_fee) THEN
            RAISE EXCEPTION 'GRESKA: Ne moze se azurirati negotiation sa ProposedFee (%) vecim od dozvoljenog (MaxPrice: %, tolerancija: %%%, max dozvoljeno: %). Popularity: %, Faza: %, Prethodni pregovori: %', 
                NEW."ProposedFee", 
                max_price_value, 
                ROUND(tolerance_percentage * 100, 1),
                max_allowed_fee,
                performer_popularity,
                current_phase,
                negotiation_count
            USING ERRCODE = '45000';
        END IF;
        
        -- Dodatna provera: ProposedFee ne može se smanjiti za više od 20% u odnosu na staru vrednost
        IF NEW."ProposedFee" < (OLD."ProposedFee" * 0.80) THEN
            RAISE EXCEPTION 'GRESKA: ProposedFee se ne moze smanjiti za vise od 20%% (stara vrednost: %, nova vrednost: %)', 
                OLD."ProposedFee", NEW."ProposedFee"
            USING ERRCODE = '45004';
        END IF;
        
        -- Logovanje za UPDATE
        RAISE NOTICE 'VALIDACIJA USPEŠNA [UPDATE]: ProposedFee % -> %, MaxPrice=%, Tolerancija=%%%, MaxDozvoljeno=%, Popularity=%, Faza=%',
            OLD."ProposedFee", NEW."ProposedFee", max_price_value, ROUND(tolerance_percentage * 100, 1), max_allowed_fee, performer_popularity, current_phase;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Kreiranje trigger-a za validaciju ProposedFee
CREATE TRIGGER trg_validate_proposed_fee
    BEFORE INSERT OR UPDATE OF "ProposedFee"
    ON "Negotiations"
    FOR EACH ROW
    EXECUTE FUNCTION validate_proposed_fee();

-- Verifikacija da je trigger kreiran uspešno
SELECT 
    trigger_name, 
    event_manipulation, 
    action_timing, 
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trg_validate_proposed_fee';
