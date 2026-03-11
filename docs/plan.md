# Daily költségvetéskezelő alkalmazás – Terv

## Edited

- 2026-03-11: A DB dokumentáció frissítve lett a refaktorált backend séma alapján.
- 2026-03-11: A `external_identities` helyett `provided_users`, az `icon_id` helyett `icon_name`, valamint a jelenleg nem aktív `icons` és `notification_logs` táblák dokumentációja kivezetésre került az aktuális sémaleírásból.
- 2026-03-11: A tranzakciós integritási szabályok, indexek és provider mezők a jelenlegi `backend/db/models.py` implementációhoz lettek igazítva.

## Technikai Architektúra & Minták

### 1. Rétegek (Layering)

* **Domain Layer:** Business Logic, UseCases, Domain Models (`data class`), Repository Interfaces. **Függőségmentes.**
* **Data Layer:** Repository Implementation, Room (Local), Ktor (Remote), Mappers (Entity/DTO ↔ Domain).
* **Presentation Layer:** Compose Multiplatform, State-holder ViewModels, Voyager Navigation.

### 2. Tervezési Minták

* **MVI (Model-View-Intent):** Determinisztikus UI állapotkezelés. A View `Intent`-eket küld, a ViewModel `State`-et publikál.
* **Observer Pattern:** `kotlinx.coroutines.flow` használata a reaktív adatfolyamhoz a DB-től a UI-ig.
* **Strategy Pattern:** Export/Import motor (`Exporter<T>` interfész: `JsonExporter`, `CsvExporter`).
* **Factory Pattern:** Dinamikus kategória-ikon és szín generálás.

---

## Implementációs Ütemterv (Phases)

### Phase 1: Alapozás & Perzisztencia (Infrastructure)

* **Dependency Injection:** Koin alapmodulok felállítása (`coreMain`, `androidMain`, `iosMain`).
* **Adatmodell:** Room Entity-k definiálása: `Account`, `Category`, `Transaction`.
* **Type Converters:** Pénznem (`Long` alapú tárolás) és `Instant` (időbélyeg) konverterek.
* **Shared Models:** Szerver-kliens közös DTO-k definiálása a `shared` modulban.

### Phase 2: Core Üzleti Logika (Domain & Data)

* **Repository Logic:** Az "Offline-first" logika implementálása (a UI Flow-n keresztül figyeli a lokális DB-t, miközben a Repository aszinkron szinkronizál a Ktor-ral).
* **UseCases:**
* `AddTransactionUseCase`: Tranzakció rögzítés + számlaegyenleg kalkuláció.
* `DeleteCategoryUseCase`: Kapcsolódó tételek átmozgatása "Egyéb" kategóriába (Spec 2.3).
* `AccountTransferUseCase`: Belső átutalás atomi tranzakcióként kezelése.


### Phase 3: UI & Navigation (Presentation)

* **Design System:** Material 3 `ColorScheme` és `Typography` implementálása.
* **Navigation:** Voyager `Screen` alapú navigáció + `ScreenModel` (ViewModel) integráció.
* **Dashboard:** Pénzforgalmi összesítők (Aggregate SQL lekérdezések alapján).

### Phase 4: Automatizáció & Notification (Platform Specific)

* **Android Service:** `NotificationListenerService` implementáció.
* **Parsing Engine:** Regex alapú kinyerő logika (Regex minták tárolása és frissítése).
* **Pending Queue:** Room tábla a sikertelenül feldolgozott/szinkronizált tranzakcióknak.

### Phase 5: Auth & Cloud (Backend Integration)

* **Ktor Server:** OAuth 2.0 endpointok, PostgreSQL perzisztencia.
* **Sync Engine:** `Last-Write-Wins` szabály alapú delta-szinkronizáció.
* **Export/Import:** Fájlrendszer elérése platform-specifikusan (`expect/actual`) a CSV/JSON fájlok mentéséhez.

---

##  Megvalósítási szempontok (Best Practices)

| Feladat         | Megoldás                                                                             |
| --------------- | ------------------------------------------------------------------------------------ |
| **Pénzkezelés** | `Long` típus (cent/fillér) vagy `BigDecimal`.                                        |
| **Hálózat**     | Ktor `ContentNegotiation` + `kotlinx-serialization`.                                 |
| **Navigáció**   | Voyager (támogatja a tab-alapú navigációt és a stack kezelést).                      |
| **Koncurrency** | Structured Concurrency (Coroutine scopes kezelése a ViewModel élettartamához kötve). |
s
## Mappastruktúra

### 1. Teljes Projektszintű Struktúra

A projekt gyökerében külön választjuk a kliens alkalmazást (composeApp), a szervert (server) és a közös adatmodelleket (shared-models).
```
DailyRoot/
├── composeApp/                 # KMP Kliens modul (UI + Üzleti logika)
├── server/                     # Ktor Szerver modul (Backend)
├── shared/                     # Opcionális: Tisztán logika, ha a UI-t teljesen külön akarod
└── build.gradle.kts
```

### 2. A composeApp (Kliens) Részletes Struktúrája
Itt dől el az Offline-first működés. A commonMain tartalmazza a Repository-t, amely eldönti, hogy a LocalDataSource-ból (Room) vagy a RemoteDataSource-ból (Ktor) kérje az adatokat.

```
composeApp/
├── commonMain/kotlin/hu/daily/app/
│   ├── core/                        # Alapkövek (DI, Network, DB config)
│   │   ├── di/                      # Koin modulok (Dependency Injection)
│   │   ├── error/                   # Failure osztályok (NetworkError, DatabaseError)
│   │   └── util/                    # Platform-független helper-ek
│   ├── data/                        # ADAT RÉTEG (Implementációk)
│   │   ├── local/                   # Helyi adatbázis (Room)
│   │   │   ├── dao/                 # Adatbázis műveletek interfészei
│   │   │   └── entity/              # Adatbázis táblák (@Entity)
│   │   ├── remote/                  # Hálózati elérés (Ktor)
│   │   │   ├── api/                 # API hívások (EndPoint-ok)
│   │   │   └── dto/                 # Szerverről érkező adatmodellek
│   │   ├── repository/              # A REPOSITORY megvalósítása (itt van a Sync logika)
│   │   └── mapper/                  # DTO -> Domain és Entity -> Domain átalakítók
│   ├── domain/                      # DOMAIN RÉTEG (Üzleti szabályok)
│   │   ├── model/                   # "Tiszta" adatmodellek (Transaction, Account)
│   │   ├── repository/              # Repository INTERFÉSZEK
│   │   └── usecase/                 # Egy funkció = egy osztály (pl. AddTransactionUseCase)
│   └── ui/                          # MEGJELENÍTÉS RÉTEG
│       ├── theme/                   # Színpaletta, Tipográfia (Material 3)
│       ├── components/              # Újrafelhasználható gombok, kártyák
│       ├── navigation/              # Navigációs gráf (Voyager/Decompose)
│       └── features/                # Funkció alapú bontás (MVI/MVVM mintával)
│           ├── dashboard/           # View, ViewModel, State, Intent (ha MVI)
│           ├── transaction/
│           └── settings/
├── androidMain/                     # Android-specifikus megvalósítások (pl. WorkManager)
├── iosMain/                         # iOS-specifikus (pl. Background fetch)
└── desktopMain/                     # Desktop-specifikus (pl. SQLite driver)
```

### 3. A server (Backend) Struktúrája
A szerver felel az OAuth hitelesítésért és a felhő alapú szinkronizációért (PostgreSQL használata javasolt).

```
server/src/main/kotlin/hu/daily/server/
├── plugins/                         # Ktor plugin-ek (Auth, Serialization, HTTP, Routing)
├── features/                        # Backend funkciók
│   ├── auth/                        # Google OAuth 2.0 kezelése
│   ├── sync/                        # Delta-sync logika a kliensnek
│   └── transaction/                 # Tranzakciós API végpontok
├── database/                        # Szerveroldali adatbázis (Exposed vagy Hibernate)
│   ├── tables/                      # DB Séma definíciók
│   └── DatabaseFactory.kt           # Connection pool és inicializálás
└── Application.kt                   # Szerver belépési pont
```

### 4. Hogyan működik a különbség? (Tervezési minták)
A DB és a Remote definiálása:
Adatbázis (Room): A commonMain/data/local-ban definiálod az @Entity-ket és a Dao-kat. Az adatbázis példányosítását viszont az androidMain és iosMain alatt kell megtenni (a Driver miatt), majd a Koin segítségével "beadni" a common részbe.

Remote vs Lokális: A Repository minta (pl. TransactionRepositoryImpl) a kulcs. Ez az osztály kap egy TransactionDao-t és egy TransactionApi-t.

Íráskor: Először elmenti a helyi DB-be, majd elindít egy háttérfolyamatot a szerverre küldéshez.

Olvasáskor: A UI felé a helyi DB-ből streameli az adatokat (Flow), így offline is azonnali a válasz.

A Repository minta működése (Példa):
Kotlin
```kotlin
// commonMain/domain/repository/TransactionRepository.kt
interface TransactionRepository {
    fun getTransactions(): Flow<List<Transaction>>
    suspend fun addTransaction(transaction: Transaction)
    suspend fun syncWithServer() // Ez hívja meg a Remote-ot
}
```
Értesítés-feldolgozás helye:
Mivel ez egy platformspecifikus dolog (Androidon NotificationListenerService), az értesítés elkapása az androidMain-ben történik, de az üzenet szövegének parzolása és tranzakcióvá alakítása már a commonMain/notification mappában lévő platformfüggetlen logikával megy.

## Leírás

```text
DailyRoot/
├── composeApp/                         # KMP Kliens modul (Android, iOS, Desktop)
│   ├── commonMain/                     # A KÓD 90%-A ITT VAN
│   │   └── kotlin/hu/daily/app/
│   │       ├── core/                   # Infrastruktúra
│   │       │   ├── di/                 # Koin Modulok (AppModule, NetworkModule)
│   │       │   ├── network/            # Ktor kliens konfiguráció
│   │       │   ├── database/           # Room Database definíció
│   │       │   └── util/               # Formatterek, konstansok, kiterjesztések
│   │       ├── domain/                 # ÜZLETI LOGIKA (Tisztán Kotlin)
│   │       │   ├── model/              # Domain Modellek (Transaction, Account)
│   │       │   ├── repository/         # Interfészek (TransactionRepository)
│   │       │   └── usecase/            # Egy funkció - egy osztály (AddTransactionUseCase)
│   │       ├── data/                   # ADAT IMPLEMENTÁCIÓ
│   │       │   ├── local/              # Room Entity-k és DAO-k
│   │       │   ├── remote/             # Ktor API hívások és DTO-k
│   │       │   ├── repository/         # Repo Impl (Offline-first logika)
│   │       │   └── mapper/             # Konvertálók (Entity <-> Domain <-> DTO)
│   │       ├── ui/                     # MEGJELENÍTÉS (Compose Multiplatform)
│   │       │   ├── theme/              # Színpaletta, Tipográfia (Material 3)
│   │       │   ├── components/         # Újrafelhasználható UI elemek
│   │       │   ├── navigation/         # Navigációs gráf (Voyager/Decompose)
│   │       │   └── features/           # Funkció alapú bontás (Screen + ViewModel)
│   │       │       ├── dashboard/      # Összesítések, diagramok
│   │       │       ├── transaction/    # Tranzakció lista és szerkesztés
│   │       │       └── settings/       # Import/Export, Kategória kezelés
│   │       └── notification/           # Értesítés-feldolgozó motor (Platformfüggetlen rész)
│   ├── androidMain/                    # Android specifikus kód (Notification Listener, WorkManager)
│   ├── iosMain/                        # iOS specifikus kód (Background Task, Native Drivers)
│   └── desktopMain/                    # Desktop specifikus kód (SQLite driver)
│
├── server/                             # Ktor Backend modul
│   └── src/main/kotlin/hu/daily/server/
│       ├── plugins/                    # Auth, Serialization, Routing
│       ├── database/                   # PostgreSQL séma (Exposed/Hibernate)
│       └── features/                   # Backend API végpontok (Sync, Auth)
│
├── shared-models/                      # Közös DTO-k a szerver és kliens között (Opcionális)
│   └── commonMain/kotlin/              # Típusbiztos kommunikációhoz
│
├── build.gradle.kts                    # Projekt szintű gradle beállítások
└── settings.gradle.kts                 # Modulok regisztrációja

```

### Néhány fontos megjegyzés a struktúrához:

* **`domain/`**: Ebben a mappában soha ne legyen `import android.*` vagy `import androidx.room.*`. Ez a réteg maradjon érintetlenül "tiszta" Kotlin.
* **`data/mapper/`**: Ezek kulcsfontosságúak. Itt választod el az adatbázis tábláit (`Entity`) a felületen megjelenő modellektől (`Domain`). Ha változik a DB séma, csak a mappert és az entity-t kell módosítanod, a UI-t nem.
* **`ui/features/`**: Javaslom, hogy minden feature-nek legyen saját almapája (pl. `dashboard`), amiben ott van a `DashboardScreen.kt` (UI) és a `DashboardViewModel.kt` is. Így egy helyen találsz meg mindent, ami egy funkcióhoz tartozik.