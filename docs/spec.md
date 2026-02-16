# Daily költségvetéskezelő alkalmazás – specifikáció

**Készítette:** Szenes Márton (KTZRDZ)  
**Dátum:** 2026. február 16.

---

## 1. Cél és hatókör

A Daily célja, hogy a felhasználó napi pénzmozgásait (bevétel, kiadás, belső átutalás) rögzítse, visszakereshetően tárolja, és összesítésekkel támogassa a döntéseit.

Az alkalmazás elsődleges platformja mobil, de a rendszer több platformon futtatható.

---

## 2. Funkcionális követelmények

### 2.1. Hitelesítés és profilkezelés

1. A rendszer támogat lokális profilt, amely internet nélkül is használható.
2. A rendszer támogat Google-alapú bejelentkezést (OAuth 2.0) felhőszinkronhoz.
3. Lokális profil és Google-fiók összekapcsolásakor a lokális adatok migrálhatók.
4. Adatütközés esetén determinisztikus szabályt kell alkalmazni (alapértelmezés: last-write-wins).

### 2.2. Számlák (Accounts)

1. Több számla kezelése támogatott.
2. Minden számlához kötelező mezők: név, pénznem, kezdőegyenleg.
3. Opcionális mezők: ikon, szín, megjegyzés.

### 2.3. Kategóriák (Categories)

1. A kategóriák hierarchikusak (szülő–gyerek kapcsolat).
2. Kategória törlésekor a kapcsolódó tételek az „Egyéb” kategóriába kerülnek.
3. Az „Egyéb” kategória nem törölhető.

### 2.4. Tranzakciók (Transactions)

1. A rendszer kezeli a bevétel, kiadás és belső átutalás típusú tételeket.
2. Kötelező mezők: típus (kiadás / bevétel), összeg, pénznem, időbélyeg, forrásszámla.
3. Opcionális mezők: kategória, megjegyzés, bizonylatkép.
4. Belső átutalás esetén kötelező a célszámla; eltérő pénznem esetén árfolyam vagy célösszeg megadása szükséges.

### 2.5. Kimutatások és szűrés

1. Időalapú összesítések: napi, heti, havi, éves.
2. Szűrési lehetőségek: időszak, számla, kategória, tranzakciótípus.
3. Kimenetek: listanézet és diagram (kör- vagy oszlopdiagram).

### 2.6. Import / export

1. Export formátumok: JSON, CSV.
2. Import formátumok: JSON, CSV.
3. Az import validálja a kötelező mezőket; hibás rekord nem kerül mentésre.
4. XLSX támogatás későbbi bővítésként kezelendő.

### 2.7. Közös használat

1. Több felhasználós funkciók (ismerősök, megosztott költségvetés).
2. A modul tervezése során biztosítani kell a későbbi bővíthetőséget.

---

## 3. Automatikus értesítés-feldolgozás

### 3.1. Forrás és feldolgozás

1. A rendszer képes kijelölt pénzügyi alkalmazások értesítéseit feldolgozni.
2. A feldolgozás célja a következő mezők kinyerése: tranzakciótípus, összeg, pénznem, kereskedő/partner név.
3. A rendszer javasol kategóriát korábbi adatok alapján.

### 3.2. Offline működés

1. Hálózat hiányában az értesítések helyi sorban tárolódnak.
2. Kapcsolat helyreállásakor a sor feldolgozása automatikusan megtörténik.

### 3.3. Belső átutalás felismerése

1. A rendszer azonosítja a belső számlák közötti pénzmozgásra utaló mintákat.
2. Sikeres felismerés esetén a tétel átutalásként rögzül, nem kiadásként.

---

## 4. Nem-funkcionális követelmények (NFR)

### 4.1. Használhatóság

1. Minden létrehozás, módosítás, törlés művelethez egyértelmű felhasználói visszajelzés tartozik.
2. Az automatikusan rögzített tételekről külön visszajelzés jelenik meg.

### 4.2. Megbízhatóság

1. Az adatműveletek tranzakcióbiztosan futnak; félbemaradt művelet nem hagyhat inkonzisztens állapotot.
2. Szinkronizációs hibák esetén a rendszer naplóz és újrapróbálkozási mechanizmust alkalmaz.

---

## 6. Minimális kritériumok (MVP)

1. A felhasználó képes lokális profillal belépni és tranzakciókat rögzíteni.
2. A felhasználó képes Google-fiókot kapcsolni és adatot szinkronizálni.
3. A rendszer kezeli a bevétel/kiadás/átutalás típusokat, valamint a kategóriákat és számlákat.
4. Elérhető legalább JSON és CSV import/export.
5. Elérhető napi/heti/havi/éves összesítés és alapdiagram.
6. Értesítésalapú automatikus tranzakció-feldolgozás működik, offline sorral.