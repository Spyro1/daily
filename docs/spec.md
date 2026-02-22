# Daily Költségvetéskezelő – Részletes Funkcionális Specifikáció v1.1

**Készítette:** Szenes Márton (KTZRDZ)

**Dátum:** 2026. február 22.

---

## 1. Adatmodell és Alapelvek

A rendszer **offline-first** működésű. Minden rekord rendelkezik egy kliens oldalon generált `UUID`-val, egy `updated_at`  időbélyeggel és egy `deleted_at` időbélyeggel a szinkronizációhoz. Az összegek tárolása fixpontos formátumban történik (4 tizedesjegyig a kerekítési hibák elkerülése végett).

---

## 2. Profil és Hitelesítés Use Cases (PC)

| Azonosító | Megnevezés                 | Leírás / Üzleti logika                                                                                                        |
| --------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **PC-01** | Lokális profil létrehozása | Első indításkor létrejön egy titkosított helyi adatbázis. Nem igényel internetet.                                             |
| **PC-02** | Google Auth társítás       | OIDC token lekérése. Sikeres válasz után a helyi felhasználó (`user_id`) összekapcsolódik a Google (`sub`) azonosítóval.      |
| **PC-03** | Adszinkronizáció           | Társításkor a felhőben nem létező helyi rekordok feltöltésre kerülnek. Ütközéskor (azonos UUID) a frissebb `updated_at` nyer. |
| **PC-04** | Kijelentkezés              | -                                                                                                                             |

---

## 3. Számlakezelés Use Cases (AC)

| Azonosító | Megnevezés          | Leírás / Üzleti logika                                                                                                                                                  |
| --------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AC-01** | Számla létrehozása  | Kötelező: név, devizanem (ISO 4217), kezdőegyenleg. (A kezdőegyenleg egy automatikus tranzakciót generál.)  Opcionális: Ikon, szín, Beleszámítódjon-e a teljes összegbe |
| **AC-02** | Számla szerkesztése | Név, ikon, beleszámítódjon-e a teljes öszegbe kapcsoló módosítható. A devizanem csak akkor módosítható, ha még nincs hozzárendelt tranzakció.                           |
| **AC-03** | Számla archiválása  | Törlés helyett archiválás: nem jelenik meg a választólistákban, de az előzményekben és statisztikákban megmarad.                                                        |
| **AC-04** | Egyenleg kalkuláció | Dinamikus érték. Nem tárolt érték, minden lekéréskor számítódik a hozzá kapcsolódó tranzakciókból.                                                                      |

---

## 4. Kategóriakezelés Use Cases (CC)

| Azonosító | Megnevezés            | Leírás / Üzleti logika                                                                                                      |
| --------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **CC-01** | Kategória létrehozása | Új kategória rögzítése a hierarchiában. Opcionálisan megadható egy `parent_id`.                                             |
| **CC-02** | Kategória áthelyezése | Szülő kategória módosítása. A fa struktúra épségét ellenőrizni kell (nem lehet önmaga vagy saját leszármazottja a szülője). |
| **CC-03** | Kategória törlése     | Ha vannak hozzárendelt tranzakciók, a rendszer kényszeríti az átmozgatást az "Egyéb" (rendszerkategória) alá.               |

---

## 5. Tranzakciókezelés Use Cases (TR)

| Azonosító | Megnevezés              | Leírás / Üzleti logika                                                                                                                                                                          |
| --------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TR-01** | Kiadás/Bevétel rögzítés | Kötelező: összeg, kiadás/bevétel, dátum (automatikusan az adott dátum ha nincs megadva), forrásszámla, kategória. Opcionális: Megjegyzés. Mentéskor a számla egyenlege azonnal frissül a UI-on. |
| **TR-02** | Belső átutalás          | Kötelező: forrásszámla, célszámla. Ha a devizanem eltér, meg kell adni a forrás deviza mennyiségét, és hogy ez mennyi cél deviza összegre váltandó.                                             |
| **TR-03** | Tranzakció módosítása   | Bármely mező szerkeszthető. Számla vagy összeg módosításakor a rendszer újraszámolja az érintett számlák egyenlegét.                                                                            |
| **TR-04** | Tranzakció törlése      | A tranzakció törlése nem törli az adatbázisból, hanem csak "archiválja", azaz a `deleted_at` mezőt beállítja. Nem számít a számla egyenlegébe.                                                  |

---

## 6. Automatikus feldolgozás (Notification Parser)

### 6.1. Értesítés feldolgozási folyamat

1. **Trigger:** A rendszer figyeli a beállított banki appok értesítéseit.
2. **Parsing:** AI alapú szövegelemzés, amely megpróbálja kinyerni a tranzakció összegét, dátumát, és ha lehetséges, a számlákat és kategóriákat.
3. **Matching:** Ha a parser képes azonosítani a számlákat és kategóriákat, akkor létrehozza a tranzakciót. Ha nem, akkor egy "feldolgozatlan értesítés" rekord jön létre, amely később manuálisan feldolgozható, ezáltal tanítva a parser-t. Valamint a tévesen feldolgozott értesítések is javíthatóak, és ezekből is tanul a parser.
4. **Queueing:** Ha nincs internet, az értesítés nyers szövege egy lokális sorba (Local Queue) kerül, és később kerül feldolgozásra amikor lesz internet.

---

## 7. Import / Export (IE)

| Azonosító | Megnevezés | Leírás / Üzleti logika                                                                                        |
| --------- | ---------- | ------------------------------------------------------------------------------------------------------------- |
| **IE-01** | Export     | A teljes adatbázis (számlák, kategóriák, tranzakciók) exportálása JSON formátumba, vagy síkstruktúrás CSV-be. |
| **IE-02** | Import     | CSV/JSON fájl beolvasása.                                                                                     |
* *Séma ellenőrzés:* Hiányzó kötelező mezők esetén a rekord elvetése.
* *Deduplikáció:* Ha az rekord azonosító egyezik, a rekordot duplikáltnak minősíti és kihagyja.


---

## 8. Hibaágak és Kivételkezelés

* **Konfliktuskezelés:** Ha ugyanazt a rekordot két eszközön módosították, az a verzió marad meg, amelyiknek nagyobb az `updated_at` értéke (Amelyik később lett frissítve).
* **Hibás parsing:** Ha az értesítésből az összeg nem olvasható ki, a parser létrehoz egy "feldolgozatlan értesítés" rekordot, amely manuálisan javítható.
