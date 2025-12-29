# Database Migration Guide

## Hvordan Supabase Migrasjoner Fungerer

Når du pusher migrasjoner med `supabase db push`, vil Supabase:

1. **Kjøre migrasjonene i rekkefølge** (basert på timestamp i filnavnet)
2. **Kun endre det som er spesifisert** i migrasjonene
3. **Ikke berøre tabeller/strukturer som ikke er nevnt** i migrasjonene

## Ditt Nåværende Scenario

Du har tabeller i produksjon som ikke eksisterer lokalt:
- `Items`
- `campaign`
- `user`

Dine lokale migrasjoner oppretter:
- `shop`
- `shop_item`

## Hva Skjer Når Du Pusher?

✅ **Trygt**: Når du pusher dine migrasjoner, vil:
- `shop` og `shop_item` tabellene bli opprettet i produksjon (hvis de ikke allerede eksisterer)
- RLS policyene bli oppdatert for `shop` og `shop_item`
- **Eksisterende tabeller** (`Items`, `campaign`, `user`) **vil IKKE bli påvirket**

## Vil Dataen Forsvinne?

**NEI! Dataen vil IKKE forsvinne.** 

Migrasjonene dine inneholder kun:
- ✅ `CREATE TABLE IF NOT EXISTS` - Oppretter bare tabeller hvis de ikke eksisterer
- ✅ `ALTER TABLE ... ADD CONSTRAINT` - Legger bare til constraints, sletter ikke data
- ✅ `DROP POLICY` / `CREATE POLICY` - Endrer bare sikkerhetsregler (RLS policies), ikke data
- ❌ **INGEN** `DROP TABLE`, `DELETE`, `TRUNCATE`, eller `DROP COLUMN` statements

**Alle eksisterende data i produksjon vil forbli intakt.**

## Anbefalt Fremgangsmåte

### Option 1: Push Direkte (Trygt for POC)

Hvis du bare vil legge til shop-funksjonalitet uten å endre eksisterende tabeller:

```bash
# Sjekk forskjeller først
supabase db diff --linked

# Push migrasjonene
supabase db push
```

Dette er trygt fordi migrasjonene kun oppretter nye tabeller og policyer.

### Option 2: Synkroniser Lokalt Først (Anbefalt for Produksjon)

For å unngå fremtidige problemer, kan du synkronisere produksjonsskjemaet lokalt:

```bash
# 1. Hent produksjonsskjemaet
supabase db dump --linked --schema public --data-only=false > supabase/migrations/$(date +%Y%m%d%H%M%S)_sync_production_tables.sql

# 2. Rydd opp i migrasjonen (fjern duplikater, sorter)
# 3. Test lokalt
supabase db reset --local

# 4. Push til produksjon
supabase db push
```

### Option 3: Sjekk Forskjeller Først

```bash
# Se hva som er forskjellig
supabase db diff --linked

# Hvis du ser noe uventet, kan du:
# 1. Opprette en migrasjon for å synkronisere
# 2. Eller bare pushe dine nye migrasjoner (trygt hvis de ikke konflikter)
```

## Viktige Punkter

⚠️ **Viktig**: 
- Migrasjoner kjører **kun én gang** per miljø
- Supabase holder styr på hvilke migrasjoner som allerede er kjørt
- Du kan ikke "undo" en migrasjon uten å manuelt reversere endringene

✅ **Trygt**:
- Å legge til nye tabeller påvirker ikke eksisterende
- Å oppdatere policyer påvirker kun de spesifiserte tabellene
- `CREATE TABLE IF NOT EXISTS` vil ikke feile hvis tabellen allerede eksisterer

## Når Du Skal Være Forsiktig

Vær forsiktig hvis migrasjonene dine:
- Prøver å **slette** tabeller som eksisterer i produksjon
- Prøver å **endre** kolonner i eksisterende tabeller
- Prøver å **endre** constraints som kan påvirke eksisterende data

I ditt tilfelle er migrasjonene trygge fordi de bare:
- Oppretter nye tabeller
- Oppretter/oppdaterer policyer

## Anbefaling for Din Situasjon

Siden dette er en POC og du bare legger til funksjonalitet:

1. **Push direkte** - Dine migrasjoner er trygge
2. **Test i produksjon** etter push
3. **Synkroniser lokalt senere** hvis du trenger å jobbe med de andre tabellene

```bash
# Enkel push (trygt for din situasjon)
supabase db push
```

