# KAKO PRIMENITI PL/pgSQL TRIGERE U PostgreSQL - INSTRUKCIJE

## 📋 Preduslovi
- PostgreSQL 12+ instaliran
- pgAdmin 4 instaliran i konfigurisan
- Pristup bazi podataka sa CREATE privilegijama
- MEMS baza podataka kreirana

## � Struktura Fajlova

Trigeri su organizovani u **3 zasebna fajla**:

1. **`02_function_average_spending.sql`** - Funkcije za računanje prosečnog spending-a
2. **`06_performer_triggers.sql`** - Trigeri koji koriste funkcije
3. **`00_run_performer_setup.sql`** - Master skripta sa instrukcijama

## �🚀 Korak po Korak - Primena Trigera

### **Metoda 1: Manuelno pokretanje u pgAdmin (PREPORUČENO)**

#### Korak 1: Otvaranje pgAdmin-a
1. Pokrenuti pgAdmin 4
2. Povezati se na PostgreSQL server
3. Navigirati do vaše MEMS baze podataka

#### Korak 2: Pokretanje fajlova REDOM
**VAŽNO: Redosled je bitan!**

**Prvi:** Funkcije za average spending
1. Tools → **Query Tool** (Ctrl+Shift+Q)
2. **Open File** → `02_function_average_spending.sql`
3. **Execute** (F5)
4. Proverite da nema grešaka

**Drugi:** Trigeri 
1. **New Query Tool** ili **Clear** postojeći
2. **Open File** → `06_performer_triggers.sql`  
3. **Execute** (F5)
4. Proverite da nema grešaka

**Treći:** Provera instalacije
```sql
SELECT * FROM verify_performer_system();
```

### **Metoda 2: Kroz Command Line (psql)**

```bash
# Pristup PostgreSQL konzoli
psql -U your_username -d mems_database

# Izvršavanje fajla
\i 'C:/path/to/sql-scripts/06_performer_triggers.sql'

# Izlaz
\q
```

### **Metoda 3: Kopiraj/Zalepi kod**

1. Otvoriti fajl `06_performer_triggers.sql` u text editoru
2. Kopirati ceo sadržaj (Ctrl+A, Ctrl+C)
3. U pgAdmin Query Tool-u zalepiti kod (Ctrl+V)
4. Izvršiti (F5)

---

## ✅ Verifikacija da su Trigeri Instalirani

### Proverite da li su funkcije kreirane:
```sql
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%performer%';
```

### Proverite da li su trigeri kreirani:
```sql
SELECT trigger_name, event_manipulation, action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND event_object_table = 'Performers';
```

### Proverite da li je audit tabela kreirana:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'PerformerAuditLog';
```

---

## 🧪 Testiranje Trigera

### Test 1: Dodavanje novog performer-a
```sql
INSERT INTO "Performers" (
    "Name", "Email", "Contact", "Genre", "Popularity", 
    "TechnicalRequirements", "MinPrice", "MaxPrice", "AverageResponseTime"
) VALUES (
    'john doe', 'john@example.com', '+381641234567', 'Rock', 75,
    'Guitar, Microphone, Amplifier', 500.00, 2000.00, '02:30:00'
);
```

**Očekivani rezultat:**
- Name će biti "John Doe" (auto-capitalize)
- Status će biti "Active" (popularity = 75)
- UpdatedAt će biti trenutni timestamp
- Audit log će zabeležiti INSERT operaciju

### Test 2: Dodavanje negotiation-a (testira prosečan spending)
```sql
INSERT INTO "Negotiations" (
    "PerformerId", "EventId", "ProposedFee", "Status", "InitiatedDate"
) VALUES (
    1, 1, 1500.00, 'InProgress', CURRENT_TIMESTAMP),
    (1, 2, 2000.00, 'Completed', CURRENT_TIMESTAMP),
    (1, 3, 1000.00, 'InProgress', CURRENT_TIMESTAMP);
```

**Očekivani rezultat:**
- AverageSpending kolona će biti kreirana automatski
- Prosečan spending će biti (1500+2000+1000)/3 = 1500.00
- Triger će ažurirati Performers tabelu

### Test 3: Provera rezultata
```sql
SELECT 
    p."Name", 
    p."Status", 
    p."AverageSpending",
    COUNT(n."NegotiationId") as negotiation_count,
    AVG(n."ProposedFee") as manual_avg_check
FROM "Performers" p
LEFT JOIN "Negotiations" n ON p."PerformerId" = n."PerformerId"
WHERE p."PerformerId" = 1
GROUP BY p."PerformerId", p."Name", p."Status", p."AverageSpending";
```

### Test 5: Test pomoćnih funkcija
```sql
-- Manuelno ažuriranje za performer-a ID 1
SELECT manual_update_performer_spending(1);

-- Bulk ažuriranje svih performer-a
SELECT update_all_performers_spending();

-- Provera konzistentnosti
SELECT * FROM check_spending_consistency();
```

---

## 🛠️ Upravljanje Trigerima

### Onemogućavanje trigera:
```sql
ALTER TABLE "Performers" DISABLE TRIGGER trg_validate_performer;
ALTER TABLE "Negotiations" DISABLE TRIGGER trg_after_negotiation_change;
```

### Ponovno omogućavanje:
```sql
ALTER TABLE "Performers" ENABLE TRIGGER trg_validate_performer;
ALTER TABLE "Negotiations" ENABLE TRIGGER trg_after_negotiation_change;
```

### Brisanje trigera (ako je potrebno):
```sql
DROP TRIGGER IF EXISTS trg_validate_performer ON "Performers";
DROP TRIGGER IF EXISTS trg_after_negotiation_change ON "Negotiations";
DROP FUNCTION IF EXISTS validate_performer_data();
DROP FUNCTION IF EXISTS update_performer_average_spending();
```

---

## 📊 Opis Trigera

### **Triger 1: `trg_validate_performer`**
- **Kada se izvršava:** PRE INSERT ili UPDATE na Performers tabeli
- **Funkcija:** `validate_performer_data()`
- **Šta radi:**
  - Validira email format
  - Proverava da MinPrice/MaxPrice nisu negativni
  - Proverava da je popularity između 0-100
  - Automatski postavlja UpdatedAt
  - Normalizuje Name (capitalize)
  - Auto-postavlja Status na osnovu popularity

### **Triger 2: `trg_after_negotiation_change`**  
- **Kada se izvršava:** NAKON INSERT, UPDATE ili DELETE na Negotiations tabeli
- **Funkcija:** `update_performer_average_spending()`
- **Šta radi:**
  - Računa prosečan ProposedFee za performer-a
  - Ažurira AverageSpending kolonu u Performers tabeli
  - Automatski kreira AverageSpending kolonu ako ne postoji
  - Beleži promene u log porukama

---

## 🔍 Troubleshooting

### Problem: "relation 'Performers' does not exist"
**Rešenje:** Proverite da li je tabela kreirana i da koristite tačno ime:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name ILIKE '%performer%';
```

### Problem: "permission denied"
**Rešenje:** Proverite da li imate CREATE privilegije:
```sql
GRANT CREATE ON SCHEMA public TO your_username;
```

### Problem: Triger se ne izvršava
**Rešenje:** Proverite da li je triger omogućen:
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name LIKE '%performer%';
```

---

## 📝 Napomene

1. **Case Sensitivity:** PostgreSQL koristi case-sensitive nazive tabela u navodnicima
2. **Backup:** Napravite backup baze pre instaliranja trigera
3. **Performance:** Trigeri mogu uticati na performanse - testirajte sa velikim brojem podataka
4. **Monitoring:** Pratite audit log tabelu da ne postane previše velika

---

**Autor:** GitHub Copilot  
**Datum:** 20. oktobar 2025  
**Verzija:** 1.0