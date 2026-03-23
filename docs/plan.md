# Daily költségvetéskezelő alkalmazás - Terv

## Edited

- 2026-03-23: A terv Kotlin/Ktor/Compose irányról FastAPI (Python) backend + React frontend irányra lett átállítva.
- 2026-03-23: PWA-felkészítési követelmények és roadmap hozzáadva (offline cache, manifest, service worker, installálhatóság).

## Technikai Architektúra és Minták

### 1. Rétegek (Layering)

- Backend API layer: FastAPI routerek, input/output schema validáció, auth guardok.
- Backend application layer: szolgáltatások (use-case szintű üzleti logika), tranzakciókezelés.
- Backend persistence layer: SQLAlchemy modellek, migrációk (Alembic), repository-jellegű adatelérő minták.
- Frontend presentation layer: React oldalak, feature komponensek, route-level layoutok.
- Frontend state/data layer: TanStack Query cache, API kliensek, form state, optimistic update minták.

### 2. Tervezési Minták

- Feature-first modularitás: külön csomagok a `accounts`, `categories`, `transactions`, `dashboard`, `auth` funkcióknak.
- Service layer minta: a routerek vékonyak maradnak, az üzleti logika a `services.py` fájlokban él.
- DTO/schema separation: API schema modellek elkülönítve az adatbázis modellektől.
- Request scope + dependency injection: FastAPI `Depends` alapú session/user dependencyk.
- Cache-aside frontend adatelkérés: query cache-ből olvasás, invalidate mutációk után.

---

## Implementációs Ütemterv (Phases)

### Phase 1: Stabil FastAPI alapok

- Egységesített konfiguráció (`backend/app/core/config.py`) és environment profile-ok.
- Auth megerősítése (JWT + OAuth callback flow), jogosultság-ellenőrzés endpoint szinten.
- Adatbázis integritás: kulcs indexek, constraint-ek, migrációk revíziója.
- Egyszerű health és readiness endpointok (docker/deploy kompatibilitás miatt).

### Phase 2: Domain use-case finomítás

- Tranzakció workflow-k atomizálása (létrehozás, módosítás, törlés, átvezetés).
- Kategória törlés/összevonás szabályok tisztázása szolgáltatás oldalon.
- Dashboard aggregációk teljesítmény-optimalizálása (index + query tuning).
- Tesztfedés bővítése router + service szinteken.

### Phase 3: React frontend megerősítése

- Route alapú code split a kritikus oldalakra.
- Központi API hiba- és authkezelés (`responseHandler`, refresh/redirect policy).
- Query kulcs-stratégia egysítése (`queryKeys.ts`) minden feature-re.
- Form validáció és UX állapotok (loading/error/empty) konzisztens kezelése.

### Phase 4: PWA felkészítés (React + Vite)

- Web app manifest véglegesítése (`name`, `short_name`, `icons`, `theme_color`, `display`, `start_url`).
- Service worker bevezetése (ajánlott: `vite-plugin-pwa` Workbox-szal) az alábbi stratégiákkal:
  - App shell: precache.
  - API GET: runtime cache stale-while-revalidate.
  - Statikus assetek: cache-first verziózott fájlokkal.
- Offline fallback nézetek a fő route-okhoz.
- Install prompt UX (custom "Install app" call-to-action).
- Verzionált cache invalidálás release-enként.

### Phase 5: Offline-first tranzakciós viselkedés

- Lokális queue nem idempotens mutációkra (pl. új tranzakció), újraküldés reconnect után.
- Konfliktuskezelési szabály (szerver timestamp vagy revision alapú policy).
- Sync állapot jelzése a frontendben (queued/synced/failed badge-ek).
- PWA tesztelés offline módban, majd sync

---

## Megvalósítási szempontok (Best Practices)

| Feladat              | Megoldás                                                                     |
| -------------------- | ---------------------------------------------------------------------------- |
| Pénzkezelés          | Backend oldalon decimal alapú tárolás, API-ban pontos formátum.              |
| Dátum/idő            | UTC tárolás, frontend local megjelenítés.                                    |
| API stabilitás       | Verzionált API prefix vagy schema kompatibilitási szabályok.                 |
| Frontend adatkezelés | TanStack Query + finomhangolt staleTime/cacheTime endpoint típustól függően. |
| PWA cache            | App shell precache + runtime cache policy endpoint osztályonként.            |
| Security             | JWT tárolása kockázatminimalizálva, CORS/CSRF stratégia dokumentálva.        |

---

## Mappastruktúra (jelenlegi projekthez igazítva)

### 1. Projektszintű áttekintés

```text
Daily/
├── backend/                 # FastAPI backend
├── frontend/                # React + Vite frontend
├── docs/                    # Terv, spec, schema, feljegyzések
├── assets/                  # Logo, ikonok
└── docker-compose.yml       # Lokális stack futtatás
```

### 2. Backend részletes struktúra (FastAPI)

```text
backend/
├── app/
│   ├── main.py
│   ├── routers.py
│   ├── core/                # config, logging
│   ├── auth/
│   ├── users/
│   ├── accounts/
│   ├── categories/
│   ├── transactions/
│   ├── dashboard/
│   └── icons/
├── db/
│   ├── core.py
│   ├── models.py
│   ├── migrations/
│   └── seed/
├── requirements.txt
└── alembic.ini
```

### 3. Frontend részletes struktúra (React)

```text
frontend/
├── src/
│   ├── api/                 # authClient, clients, queryClient, responseHandler
│   ├── features/            # accounts, auth, categories, dashboard, settings, transactions
│   ├── routes/              # route-level oldalak
│   ├── shared/              # közös UI/util elemek
│   ├── theme/
│   ├── constants.ts
│   ├── router.tsx
│   └── main.tsx
├── public/
│   ├── manifest.json
│   └── brand/
└── vite.config.ts
```

### 4. PWA-hoz szükséges plusz elemek

- `frontend/vite.config.ts`: PWA plugin regisztráció.
- `frontend/public/manifest.json`: véglegesített metadata és ikon készlet.
- `frontend/public/sw.js` vagy Workbox által generált service worker.
- `frontend/src/shared/pwa/`: install prompt, update notice, online/offline status hookok.

---

## Checklist a megvalósításhoz

- [x] Backend API CRUD endpointok elkészítése és dokumentálása.
- [ ] Backend synchronization logika implementálása
- [50%] Frontend route-ok és feature komponensek implementálása.
  - [x] Login/logout flow 
  - [x] Tranzakció CRUD műveletek
  - [ ] Dashboard
  - [ ] Kategória kezelés
  - [ ] Settings oldal
  - [x] Server Offline állapot jelzése
- [ ] PWA manifest és service worker bevezetése.
- [ ] Tesztelés offline módban, sync viselkedés validálása.
- [ ] Dokumentáció frissítése a végleges implementációhoz.
