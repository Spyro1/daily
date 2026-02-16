# Daily Költségvetéskezelő alkalmazás - Specifikáció

**Készítette:** Szenes Márton (KTZRDZ)
**Dátum:** 2026. február 16.

---

## 1. Rendszeráttekintés

A **Daily** egy elsősorban mobilalapú pénzügyi asszisztens, amelynek célja a napi kiadások és bevételek transzparens követése. Az alkalmazás kiemelt funkciója az automatizáció: mesterséges intelligencia segítségével képes a beérkező banki értesítések (pl. Google Pay) feldolgozására, ezzel minimalizálva a manuális adatbevitel igényét.

## 2. Funkcionális követelmények

### 2.1. Hitelesítés és felhasználókezelés

**Hibrid bejelentkezési modell:**
* **Lokális profil:** Gyors regisztráció jelszó nélkül (helyi tárolású adatok).
* **Google SSO integráció:** OAuth 2.0 alapú bejelentkezés a felhőalapú szinkronizációhoz.


* **Fiók összekapcsolás:** Meglévő lokális adatok migrációja frissen csatolt Google fiókhoz.
* **Konfliktuskezelés:** Determinisztikus stratégia (pl. *last-write-wins* vagy manuális választás) a lokális és felhőalapú adatok ütközése esetén.

### 2.2. Pénzügyi entitások kezelése (CRUD)

* **Számlák (Accounts):** Több deviza kezelése, testreszabható metaadatok (ikon, színkód, egyéni megnevezés). Kezdőegyenleg rögzítése.
* **Kategóriák (Categories):** Hierarchikus rendszerezés. Törlés esetén az entitások automatikusan egy "Egyéb" gyűjtőkategóriába kerülnek (soft-delete).
* **Tranzakciók (Transactions):**
  * **Egyszerű tételek:** Bevétel/Kiadás rögzítése összeggel, időbélyeggel, megjegyzéssel és opcionális bizonylat-fotóval.
  * **Belső átutalások:** Számlák közötti mozgások kezelése, akár eltérő devizák közötti konverzióval.

### 2.3. Költségvetés és jelentések

* **Export/Import:** Adatok archiválása és hordozhatósága JSON, CSV és (később) Excel (XLSX) formátumokban.
* **Dinamikus jelentések:** Napi, heti, havi és éves összesítők, kategória-alapú elemzések, valamint egyéni szűrők (pl. időszak, számla, kategória).
* **Grafikus megjelenítés:** Interaktív diagramok (pl. kördiagram, oszlopdiagram) a kiadások és bevételek vizualizálásához.

### 2.4. Felhasználói interakciók egymással

* **Közösségi funkciók:** Ismerősök felvétele, tranzakciók megosztása, közös költségvetés létrehozása (pl. családi vagy lakótársi költségek).

## 3. AI-alapú Automatizáció

### 3.1. Intelligens értesítés-feldolgozás

Az alkalmazás a háttérben figyeli a kijelölt banki applikációk (pl. Google Pay, Revolut) push üzeneteit.

* **NLP motor:** Az üzenet szövegéből kinyeri a tranzakció típusát, az összeget, a pénznemet és a kereskedő neve alapjá negy megjegyzést ír a tranzakcióhoz.
* **Kontextus-függő kategorizálás:** A korábbi tranzakciók alapján automatikusan hozzárendeli a legvalószínűbb kategóriát. Ez később tanítható a felhasználói visszajelzések alapján.
* **Offline reziliencia:** Internetkapcsolat hiányában az üzenetek egy lokális várólistába (**Queue**) kerülnek, majd a kapcsolat helyreálltakor történik meg az AI elemzés.

### 3.2. Automatizált transzfer-felismerés

Amennyiben az üzenet belső mozgatásra utal (pl. "Pénz küldése a Revolut számlára"), a rendszer felismeri a célszámlát a felhasználó által korábban definiált nevek és kontextus alapján, így nem kettős kiadásként, hanem transzferként rögzíti.

## 4. Nem-funkcionális követelmények (NFR)

* **Felhasználói élmény (UX):** Azonnali visszajelzés (Toast/Snackbar) az automatikus tranzakciórögzítés sikerességéről.
* **Beállítások:**
  * Alapértelmezett deviza és főszámla kezelése.
  * Szabályozás az AI funkciók felett.
  * Dinamikus nézetek (Napi/Heti/Havi/Éves aggregáció).