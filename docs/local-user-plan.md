# Terv

Igen, ezt nagyon szépen és professzionálisan meg lehet csinálni, és a mostani kódod jó alap ehhez.

A legfontosabb: külön kell választani az identitást és a bejelentkezési módot.

**Röviden az ajánlott modell**
1. Legyen egy központi user rekord (ez maradjon a saját belső user).
2. Ehhez kapcsolódjanak login identity rekordok:
- local identity (név + email, opcionális eszköz-azonosító)
- google identity (provider + provider_user_id)
1. A session/JWT mindig a belső user_id-ra épüljön, ne emailre vagy provider sub-ra.

Ez adja a stabil alapot local -> Google összekötésre és szinkronra.

**A jelenlegi állapotodhoz igazítva**
A jelenlegi struktúrában ez már részben megvan:
- users + providers + provided_users táblák már támogatják a provider linkelést: models.py
- OAuth callbackben már user + provider mapping létrejön: oauth_router.py

A fő hiány jelenleg:
1. Nincs dedikált local login flow név + email bemenettel: schemas.py, oauth_router.py
2. A token validáció email + sub logikára épül, nem user_id alapú: jwt_utils.py

**Professzionális cél-architektúra**
1. Belső identitás:
- users.id legyen az egyetlen stabil principal
- JWT payload: user_id, auth_method, optional provider
- ne az email legyen a kulcs

2. Local login (név + email):
- endpoint: POST /auth/local/login
- input: display_name, email
- működés:
  - ha van már devicehez kötött local user, azt adja vissza
  - ha nincs, új local user létrehozása kötelező emaillel
  - access + refresh cookie kiadás

3. Google login:
- mostani OAuth flow maradhat, de callback végén ne provider sub legyen a fő kulcs
- a belső user_id kerüljön a tokenbe

4. Account linking (helyi user -> Google):
- endpoint: POST /auth/link/google/start
- Google callback külön branch:
  - ha callback előtt van aktív session, akkor linking flow
  - ha nincs session, akkor sima login flow
- linkingnél:
  - ha Google identity nincs kötve máshoz: provider user maradjon a kanonikus user rekord
  - a local userhez tartozó domain adatok (accounts, categories, transactions, stb.) migrálódjanak a provider user user_id-jára
  - a local user rekord migráció után archival/soft delete státuszba kerüljön
  - ha már más userhez van kötve: konfliktus hiba (manual merge kell)

5. Szinkron stratégia:
- amíg local-only user van, adatok mennek lokális tárba
- Google link után:
  - egyszeri full sync feltöltés a szerverre
  - utána normál online userként működik

**Ha tényleg lokális adatbázisról beszélsz (frontend oldalon)**
Ez egy külön réteg, nem csak auth kérdés.

Javasolt minta:
1. Kliens oldali DB:
- weben: IndexedDB
- mobilon: SQLite
2. Minden lokális rekord kapjon:
- local_id
- device_id
- sync_state (pending, synced, conflict)
- updated_at
3. Sync API:
- POST /sync/push
- GET /sync/pull?since=timestamp
4. Konfliktuskezelés:
- egyszerűen: last_write_wins kezdetben
- később: mező-szintű merge kritikus entitásoknál
5. Idempotencia:
- operation_id minden push műveletnél

**Konkrét minimum változtatás a mostani backendben**
1. JWT átalakítás:
- TokenData: user_id legyen kötelező
- email opcionális
- get_current_user user_id alapján töltsön usert, ne email alapján
- fájlok: schema.py, jwt_utils.py

2. User schema:
- local loginhoz nem kell külön séma mert jó a már meglévő Users séma (display_name + email mezőkkel)
- az OAuth UserCreate maradhat emailes, vagy legyen email optional
- fájl: schemas.py

3. Új local auth endpoint:
- POST /api/v1/oauth/local-login
- fájl: oauth_router.py

4. Linking flow state token:
- state-be tedd bele: flow_type (login vagy link), current_user_id (ha link)
- fájlok: google_router.py, oauth_router.py

5. Egyedi constraint-ek és védelem:
- provided_users provider+provider_user_id unique már jó
- plusz ellenőrzés linking conflict esetére service szinten
- linkingkor tranzakcióban történjen a user-id migráció minden userfüggő táblán
- migráció után local user archival/soft delete
- fájl: service.py

**Biztonsági minimum**
1. Cookies productionban secure=true.
2. CSRF védelem a local login/link végpontokon.
3. OAuth state-ben flow_type és rövid lejárat.
4. Link műveletnél friss auth required.

Ez a megoldás skálázható, auditálható, és később Apple/Facebook providerrel is bővíthető anélkül, hogy újra kellene tervezni az egész authot.

Ha szeretnéd, a következő körben ezt konkrétan be is építem a backendbe:
1. user_id alapú JWT migráció
2. local login endpoint
3. Google linking flow (login és link branch szétválasztással)

---

# Claude prompt:

Te egy senior backend architect és implementáló engineer vagy. A feladatod egy FastAPI + SQLAlchemy + PostgreSQL rendszerben a hibrid auth flow teljes, production-közeli megvalósítása.

## Cél:
Google SSO mellett legyen Local login is, ahol a felhasználó email megadásával be tud lépni (név megadása az első lokális regisztrációnál szükséges).  
A JWT és session principal mindig belső user_id legyen.  
Ha egy Local user később összeköti magát Google providerrel, akkor a Provider user rekord maradjon meg kanonikus userként, és minden Local userhez kapcsolódó adat migrálódjon át a Provider user user_id-jára atomikusan.

Fontos üzleti szabályok:
1. Local login bemenet kötelezően: display_name és email.
2. A rendszer támogassa a Google login és Local login párhuzamos működését.
3. JWT payload kötelezően user_id alapú legyen, ne email/sub alapú.
4. Linking esetén:
5. Ha a Google identity még nincs kötve másik userhez, akkor a Provider user marad.
6. A Local user összes domain adata átkerül a Provider user_id-re.
7. A Local user rekord migráció után soft delete vagy archival állapotba kerüljön.
8. Ha a Google identity már más userhez van kötve, adj vissza egyértelmű conflict hibát.
9. A migráció egyetlen tranzakcióban történjen, rollback-kel hiba esetén.
10. A rendszer idempotens legyen a linking folyamatban, amennyire reálisan megoldható.

Technikai elvárások:
1. FastAPI route-ok és Pydantic sémák frissítése.
2. SQLAlchemy service rétegben tiszta, tesztelhető függvények.
3. DB integritás és unique szabályok tiszteletben tartása.
4. Biztonság:
5. cookie secure kezelés környezetfüggően,
6. state token flow_type mezővel,
7. linking csak hitelesített sessionből indulhasson,
8. CSRF védelem javaslat és minimál implementáció ahol releváns.
9. Meglévő kódstílushoz illeszkedő módosítások.
10. Visszafelé kompatibilitás, ahol lehetséges.

Implementálandó fő flow-k:
1. Local login endpoint:
2. név + email alapján user keresés/létrehozás,
3. token kiadás.
4. Google login endpoint változtatás:
5. state tokenbe flow_type és opcionálisan current_user_id.
6. OAuth callback két ágra bontva:
7. sima login flow,
8. linking flow.
9. Linking migráció:
10. userfüggő táblák user_id átállítása Local user_id-ről Provider user_id-re,
11. migrációs tranzakció,
12. Local user archival.

Elvárt kimenet:
1. Kész kódmódosítások konkrétan a projekt fájljaiban.
2. Rövid migrációs terv, ha séma módosítás szükséges.
3. Tesztek:
4. unit teszt service szintre,
5. API teszt auth flow-ra,
6. legalább 1 conflict és 1 rollback szcenárió.
7. Rövid changelog: mi és miért változott.
8. OpenAPI kompatibilitás megőrzése vagy frissítése.

Döntési elvek:
1. Elsőbbség: adatkonzisztencia, biztonság, idempotencia.
2. Második: minimális, de tiszta refaktor.
3. Harmadik: fejlesztői érthetőség.

Ne adj csak tervet, hanem ténylegesen implementálj.
A végén add meg:
1. Módosított fájlok listája.
2. Kritikus döntések indoklása röviden.
3. Milyen edge case-ek maradtak nyitva, ha maradtak.
4. Pontos futtatási és tesztelési lépések.


---

# Step by step

**Használati szabály**
1. Mindig várd meg az előző lépés teljes implementációját és rövid teszteredményét.
2. A következő promptba másold be az előző válasz “changed files + open issues” részét is.
3. Minden prompt végére tedd oda: “Ne csak tervet adj, implementálj konkrétan.”

**Prompt 1 - Auth audit és pontos implementációs terv**
Kérlek elemezd a jelenlegi auth rendszert (Google OAuth + JWT + users/providers/provided_users), és készíts konkrét, fájlszintű implementációs tervet az alábbihoz:  
- Local login display_name + email mezővel  
- JWT principal user_id alapúra migrálása  
- Local user -> Google provider linking úgy, hogy a provider user maradjon kanonikus rekord  
- Local userhez tartozó adatok user_id migrációja provider user_id-ra tranzakcióban  
A kimenet legyen:  
- pontosan módosítandó fájlok listája  
- route/séma/service szintű teendők  
- kockázatok és migrációs sorrend  
Ne módosíts még kódot, csak végrehajtható tervet adj.

**Prompt 2 - JWT user_id migráció**
Implementáld a JWT és auth réteg migrációját user_id principalra.  
Elvárás:  
- Token payload tartalmazzon user_id-t kötelezően  
- email lehet opcionális  
- current_user feloldás user_id alapján történjen  
- meglévő auth ellenőrzések ne romoljanak el  
Adj rövid backward compatibility megjegyzést is, ha szükséges.  
Kimenet: kódmódosítás + futtatási/teszt lépések.

**Prompt 3 - Local login endpoint (display_name + email)**
Implementáld a local login flow-t:  
- endpoint: POST /api/v1/oauth/local-login  
- input: display_name, email (mindkettő kötelező)  
- viselkedés: user keresés/létrehozás, access/refresh cookie kiadás  
- validációk: üres név/email elutasítás, email formátum ellenőrzés  
Kimenet: módosított route/séma/service + minimál tesztek.

**Prompt 4 - Google link flow indítás**
Implementáld a linking indító lépést:  
- endpoint: POST /api/v1/auth/link/google/start (vagy a projekt konvenciója szerinti prefix)  
- csak hitelesített sessionből indulhat  
- OAuth state tokenbe kerüljön flow_type=link és current_user_id  
- sima Google login state flow_type=login maradjon  
Kimenet: route módosítások + state token kezelés + rövid biztonsági indoklás.

**Prompt 5 - OAuth callback szétválasztása login vs link ágra**
Refaktoráld az OAuth callbacket két explicit ágra:  
- login flow (ha nincs linking context)  
- linking flow (ha flow_type=link)  
Linkingben:  
- ha provider identity más userhez kötött, adj conflict hibát  
- ha nincs kötve, hajtsd végre a merge előkészítést  
Kimenet: tiszta, olvasható callback logika + edge case kezelés.

**Prompt 6 - User-id migrációs merge tranzakció**
Implementálj service rétegben atomi migrációt linkinghez:  
- provider user maradjon  
- local userhez tartozó userfüggő adatok (accounts, categories, transactions stb.) user_id-ja átáll provider user_id-ra  
- minden egy tranzakcióban fusson  
- hiba esetén rollback  
- végén local user archival/soft delete  
Kimenet: service függvény(ek) + tranzakciós logika + idempotencia megjegyzés.

**Prompt 7 - Constraint és adatbiztonsági finomítás**
Erősítsd meg az integritást:  
- provider + provider_user_id unique szabály kezelése alkalmazáslogikában és ahol kell DB oldalon  
- merge során duplikáció/ütközés kezelési stratégia  
- naplózás audit jelleggel (ki, mikor, mely user merge)  
Kimenet: szükséges model/migration/service változások.

**Prompt 8 - Tesztek (kritikus utak)**
Készíts célzott teszteket:  
- local login siker + validációs hiba  
- JWT user_id alapú auth ellenőrzés  
- linking success (migráció megtörténik)  
- linking conflict (provider már másik userhez kötve)  
- rollback szcenárió (részleges migráció nem maradhat)  
Kimenet: futtatható tesztek + expected eredmények.

**Prompt 9 - Security hardening**
Végezz minimál biztonsági keményítést:  
- secure cookie env-függő kezelés  
- CSRF javaslat és minimál implementáció auth író végpontokra  
- state token rövid lejárat és ellenőrzés  
- linking előtt friss auth ellenőrzés  
Kimenet: konkrét kódmódosítás + miért szükséges röviden.

**Prompt 10 - Végső integrációs ellenőrzés és dokumentáció**
Nézd át end-to-end a teljes megoldást, és adj:  
- végleges changed files lista  
- rövid changelog  
- futtatási sorrend (migration, app start, test run)  
- ismert nyitott edge case-ek  
- rövid “production readiness” checklist  
Itt már ne tervezz, hanem ellenőrizd és zárd le implementációként.

Ha szeretnéd, adok egy “ultra-rövid” verziót is, ahol csak 5 prompt van, és mindegyik nagyobb blokkot fed le.