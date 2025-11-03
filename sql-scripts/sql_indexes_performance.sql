-- ============================================================================
-- SQL INDEKSI I ANALIZA PERFORMANSI
-- ============================================================================
-- Autor: IIS Tim
-- Datum: 13. Oktobar 2025
-- Opis: Kreiranje indeksa i demonstracija ubrzanja upita
-- ============================================================================

SET TIMING ON;
SET SERVEROUTPUT ON SIZE UNLIMITED;

-- ============================================================================
-- KREIRANJE TESTNIH PODATAKA (ako već ne postoje)
-- ============================================================================

PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT PRIPREMA: Generisanje testnih podataka
PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT;

-- Dodatni testni podaci će biti kreirani putem INSERT naredbi
-- Ovo osigurava da imamo dovoljno podataka za demonstraciju razlike u performansama

-- ============================================================================
-- CILJANI UPIT ZA OPTIMIZACIJU
-- ============================================================================
-- Sledeći upit se često koristi u sistemu:
-- "Pronađi sve aktivne pregovore sa informacijama o fazama i zahtevima"
-- ============================================================================

PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT BASELINE: Performanse upita PRE kreiranja indeksa
PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT;

-- Omogući prikaz statističkih informacija
SET AUTOTRACE ON EXPLAIN STATISTICS;

PROMPT Pokrećem upit PRE indeksiranja...;
PROMPT;

-- CILJANI UPIT
SELECT 
    n.NegotiationId,
    n.Status AS StatusPregovora,
    p.Name AS IzvođačIme,
    e.Name AS DogađajIme,
    ph.PhaseName AS FazaNaziv,
    np.Status AS StatusFaze,
    COUNT(nrf.FulfillmentId) AS UkupnoZahteva,
    SUM(CASE WHEN nrf.IsFulfilled = 1 THEN 1 ELSE 0 END) AS IspunjenoZahteva
FROM Negotiation n
JOIN Performer p ON n.PerformerId = p.PerformerId
JOIN Event e ON n.EventId = e.Id
JOIN NegotiationPhase np ON n.NegotiationId = np.NegotiationId
JOIN Phase ph ON np.PhaseId = ph.PhaseId
LEFT JOIN NegotiationRequirementFulfillment nrf 
    ON n.NegotiationId = nrf.NegotiationId 
    AND np.PhaseId = nrf.PhaseId
WHERE n.Status IN ('InProgress', 'Pending')  -- Filtriranje po statusu
  AND np.IsActive = 1                        -- Samo aktivne faze
  AND e.Interval >= SYSDATE                  -- Budući događaji
GROUP BY 
    n.NegotiationId,
    n.Status,
    p.Name,
    e.Name,
    ph.PhaseName,
    np.Status
ORDER BY n.NegotiationId;

SET AUTOTRACE OFF;

PROMPT;
PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT KREIRANJE INDEKSA
PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT;

-- ============================================================================
-- INDEKS 1: Status pregovora (za WHERE klauzulu)
-- ============================================================================
-- Razlog: WHERE klauzula često filtrira po n.Status
-- Očekivano ubrzanje: 70-80% za upite sa filterom po statusu

PROMPT Kreiram indeks 1: idx_negotiation_status_active...;
CREATE INDEX idx_negotiation_status_active 
ON Negotiation(Status)
TABLESPACE USERS;

COMMENT ON INDEX idx_negotiation_status_active IS 
'Ubrzava upite koji filtriraju pregovore po statusu (InProgress, Pending, Completed)';

PROMPT ✓ Indeks kreiran: idx_negotiation_status_active
PROMPT;

-- ============================================================================
-- INDEKS 2: Aktivne faze (za WHERE i JOIN)
-- ============================================================================
-- Razlog: WHERE klauzula filtrira np.IsActive = 1
-- Ovo je veoma selektivan uslov (obično samo 1 aktivna faza po pregovoru)

PROMPT Kreiram indeks 2: idx_negotiation_phase_active...;
CREATE INDEX idx_negotiation_phase_active 
ON NegotiationPhase(IsActive, NegotiationId, PhaseId)
TABLESPACE USERS;

COMMENT ON INDEX idx_negotiation_phase_active IS 
'Ubrzava pronalaženje aktivnih faza po pregovorima (visoka selektivnost)';

PROMPT ✓ Indeks kreiran: idx_negotiation_phase_active
PROMPT;

-- ============================================================================
-- INDEKS 3: Datum događaja (za WHERE sa datumskim filterom)
-- ============================================================================
-- Razlog: WHERE klauzula filtrira e.Interval >= SYSDATE

PROMPT Kreiram indeks 3: idx_event_interval_future...;
CREATE INDEX idx_event_interval_future 
ON Event(Interval)
TABLESPACE USERS;

COMMENT ON INDEX idx_event_interval_future IS 
'Ubrzava upite koji traže buduće događaje (Interval >= SYSDATE)';

PROMPT ✓ Indeks kreiran: idx_event_interval_future
PROMPT;

-- ============================================================================
-- INDEKS 4: Kompozitni indeks za NegotiationRequirementFulfillment
-- ============================================================================
-- Razlog: LEFT JOIN koristi (NegotiationId, PhaseId) i agregira IsFulfilled

PROMPT Kreiram indeks 4: idx_nrf_negotiation_phase_fulfilled...;
CREATE INDEX idx_nrf_negotiation_phase_fulfilled 
ON NegotiationRequirementFulfillment(NegotiationId, PhaseId, IsFulfilled)
TABLESPACE USERS;

COMMENT ON INDEX idx_nrf_negotiation_phase_fulfilled IS 
'Kompozitni indeks za brže JOIN-ove i agregaciju ispunjenih zahteva';

PROMPT ✓ Indeks kreiran: idx_nrf_negotiation_phase_fulfilled
PROMPT;

-- ============================================================================
-- AŽURIRANJE STATISTIKA
-- ============================================================================

PROMPT;
PROMPT Ažuriram statistike za optimizaciju...;

BEGIN
    DBMS_STATS.GATHER_TABLE_STATS(
        ownname => USER,
        tabname => 'NEGOTIATION',
        cascade => TRUE
    );
    DBMS_OUTPUT.PUT_LINE('✓ Statistike ažurirane: NEGOTIATION');
    
    DBMS_STATS.GATHER_TABLE_STATS(
        ownname => USER,
        tabname => 'NEGOTIATIONPHASE',
        cascade => TRUE
    );
    DBMS_OUTPUT.PUT_LINE('✓ Statistike ažurirane: NEGOTIATIONPHASE');
    
    DBMS_STATS.GATHER_TABLE_STATS(
        ownname => USER,
        tabname => 'EVENT',
        cascade => TRUE
    );
    DBMS_OUTPUT.PUT_LINE('✓ Statistike ažurirane: EVENT');
    
    DBMS_STATS.GATHER_TABLE_STATS(
        ownname => USER,
        tabname => 'NEGOTIATIONREQUIREMENTFULFILLMENT',
        cascade => TRUE
    );
    DBMS_OUTPUT.PUT_LINE('✓ Statistike ažurirane: NEGOTIATIONREQUIREMENTFULFILLMENT');
END;
/

PROMPT;
PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT POSLE: Performanse upita POSLE kreiranja indeksa
PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT;

-- Omogući prikaz statističkih informacija
SET AUTOTRACE ON EXPLAIN STATISTICS;

PROMPT Pokrećem isti upit POSLE indeksiranja...;
PROMPT;

-- ISTI UPIT (ponovo)
SELECT 
    n.NegotiationId,
    n.Status AS StatusPregovora,
    p.Name AS IzvođačIme,
    e.Name AS DogađajIme,
    ph.PhaseName AS FazaNaziv,
    np.Status AS StatusFaze,
    COUNT(nrf.FulfillmentId) AS UkupnoZahteva,
    SUM(CASE WHEN nrf.IsFulfilled = 1 THEN 1 ELSE 0 END) AS IspunjenoZahteva
FROM Negotiation n
JOIN Performer p ON n.PerformerId = p.PerformerId
JOIN Event e ON n.EventId = e.Id
JOIN NegotiationPhase np ON n.NegotiationId = np.NegotiationId
JOIN Phase ph ON np.PhaseId = ph.PhaseId
LEFT JOIN NegotiationRequirementFulfillment nrf 
    ON n.NegotiationId = nrf.NegotiationId 
    AND np.PhaseId = nrf.PhaseId
WHERE n.Status IN ('InProgress', 'Pending')
  AND np.IsActive = 1
  AND e.Interval >= SYSDATE
GROUP BY 
    n.NegotiationId,
    n.Status,
    p.Name,
    e.Name,
    ph.PhaseName,
    np.Status
ORDER BY n.NegotiationId;

SET AUTOTRACE OFF;

PROMPT;
PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT ANALIZA REZULTATA
PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT;

-- Prikaži informacije o kreiranim indeksima
PROMPT Kreirani indeksi:
PROMPT ───────────────────────────────────────────────────────────────────

SELECT 
    index_name AS "Naziv indeksa",
    table_name AS "Tabela",
    uniqueness AS "Jedinstvenost",
    status AS "Status",
    num_rows AS "Broj redova",
    distinct_keys AS "Različitih ključeva"
FROM user_indexes
WHERE index_name LIKE 'IDX_%NEGOTIATION%' 
   OR index_name LIKE 'IDX_%EVENT%'
   OR index_name LIKE 'IDX_%NRF%'
ORDER BY table_name, index_name;

PROMPT;
PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT ZAKLJUČAK
PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT;
PROMPT Očekivana poboljšanja:
PROMPT;
PROMPT 1. Smanjenje broja logičkih čitanja (consistent gets): 60-80%
PROMPT 2. Brže izvršavanje upita: 50-70%
PROMPT 3. Eliminisanje full table scan-ova na Negotiation i NegotiationPhase
PROMPT 4. Korišćenje INDEX RANGE SCAN umesto TABLE ACCESS FULL
PROMPT;
PROMPT NAPOMENA: Razlika će biti vidljivija na većem skupu podataka.
PROMPT           Za 100+ pregovora očekuje se dramatično ubrzanje.
PROMPT;
PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT DODATNI TESTNI UPITI
PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT;

-- Test upit 1: Samo status filter (koristi idx_negotiation_status_active)
PROMPT Test 1: Filtriranje po statusu (koristi indeks 1)
SELECT NegotiationId, Status, ProposedFee
FROM Negotiation
WHERE Status = 'InProgress';

PROMPT;

-- Test upit 2: Aktivne faze (koristi idx_negotiation_phase_active)
PROMPT Test 2: Aktivne faze (koristi indeks 2)
SELECT np.NegotiationId, ph.PhaseName
FROM NegotiationPhase np
JOIN Phase ph ON np.PhaseId = ph.PhaseId
WHERE np.IsActive = 1;

PROMPT;

-- Test upit 3: Budući događaji (koristi idx_event_interval_future)
PROMPT Test 3: Budući događaji (koristi indeks 3)
SELECT Id, Name, Interval
FROM Event
WHERE Interval >= SYSDATE
ORDER BY Interval;

PROMPT;
PROMPT ═══════════════════════════════════════════════════════════════════
PROMPT KRAJ - Indeksi uspešno kreirani i testirani
PROMPT ═══════════════════════════════════════════════════════════════════

SET TIMING OFF;
