# Todo

## Backend

- [x] GET /categories endpointon a lista lekérése fastruktúrába?
- [x] Tranzakciók kezelése javítás, mert valami félremegy

## Frontend
- [x] Tranzakciók listájának újrarendezése, hogy a legújabb legyen elöl
- [x] Tranzakció létrehozásánál mindig error, de valójában létre is jön a tranzakció, szóval valami félremegy
- [x] Tranzakciós oldal rendezése, filterek, keresés, stb.
- [x] Tranzakciók módosítása/törlése
- [x] Számlák módosítása/törlése
- [x] Kategóriák módosítása/törlése
- [x] Kategóriák fa struktúrában való megjelenítése
- [x] Dashboard tranzakciók limitálása
- [x] Utility redirect gombok kirakása
- [x] Offline esetben lokálba mentse a módosításokat a synchelt felhasználóval is, és online esetben szinkronizálja azokat

---

## Kész

### Backend
- **Kategóriafa endpoint** — Elkészült a `GET /api/v1/categories/tree`, amely beágyazott `CategoryTree` struktúrát ad vissza. Implementálva: `build_category_tree()` a `categories/service.py` fájlban és `CategoryTree` séma a `categories/schemas.py` fájlban.
- **Dashboard eager loading javítás** — Javítva lett a dashboard lazy-load hibája: a `dashboard/service.py` most `get_transactions_for_user_filtered()` hívást használ `eager=True` és `limit=50` paraméterekkel.

### Frontend — Hibajavítások
- **Tranzakció létrehozási hiba** — A fő ok az volt, hogy a dashboard mutation utáni újratöltése nem eager betöltést használt aszinkron környezetben. Ezt a backend eager loading javítás megoldotta.
- **Legújabb tranzakciók elöl** — A backend már `order_by(occurred_at.desc())` szerint rendezett; a lokális mód is javítva lett `.orderBy('occurred_at').reverse()` használatával.

### Frontend — Új funkciók
- **Tranzakció szerkesztés/törlés** — Elkészült az `EditTransactionPage` teljes űrlappal, törlés megerősítő párbeszédablakkal és `routes/transactions/$id.tsx` route-tal.
- **Számla szerkesztés/törlés** — Elkészült az `EditAccountPage` ikon/szín választóval, archiválás kapcsolóval, törlés párbeszédablakkal és `routes/accounts/$id.tsx` route-tal.
- **Kategória szerkesztés/törlés** — Elkészült az `EditCategoryPage` típusváltóval, szülőkategória választóval, ikon/szín választóval, törlés párbeszédablakkal és `routes/categories/$id.tsx` route-tal.
- **Kattintható kártyák** — A `TransactionCard`, `AccountCard` és `CategoryCard` most kattintható (`ButtonBase` + navigate), és a megfelelő szerkesztő oldalra navigál.
- **Kategóriafa megjelenítés** — A `CategoryGroup` behúzott fa struktúrában jeleníti meg a kategóriákat egy rekurzív `TreeNodes` komponenssel.
- **Dashboard tranzakció limit** — A dashboard most legfeljebb 50 tranzakciót kér le (korábban korlátlan volt)
- **Offline mutation queue** — Elkészült a `src/lib/offlineQueue.ts`: offline állapotban sorba teszi a módosításokat `localStorage`-ba (online módú felhasználóknál), majd visszakapcsolódáskor sorban visszajátssza őket, utána query invalidálás és szinkron értesítés történik.
- **Tranzakció oldal újratervezés** — Minden tranzakció külön `Paper` kártya lett `Stack` elrendezésben (az accounts oldal mintájára), nem egy nagy külső lista-konténerben.
- **Kategória ikonok típus szerint** — A kategória létrehozás/szerkesztés oldalon külön ikonlista van Kiadás és Bevétel típusokra. Típusváltáskor az ikon az új típus első érvényes ikonjára áll.
- **Kategória kártya ikon** — A `CategoryCard` már a mentett `icon_name` alapján rendereli a megfelelő ikont egy teljes `ICON_MAP` segítségével, nem fix `CategoryRounded` ikonnal.

### Kódbázis tisztítás és deploy-előkészítés
- **Dupla import javítás** — A `useTransactions.ts` fájlban a `@/lib/localCrud` modul kétszer volt importálva; összevonva egyetlen import blokkba.
- **Backend logging null safety** — A `request_logging_middleware` (`main.py`) `request.client` hozzáférés `AttributeError`-t okozhatott, ha a kliens `None` volt (pl. tesztek, proxy mögött). Javítva: `None`-ellenőrzéssel és fallback `-` értékkel.
- **HealthIcon elrejtése production módban** — A fejlesztői `HealthIcon` komponens a `__root.tsx`-ben most csak `import.meta.env.DEV` módban jelenik meg, production buildben nem renderelődik.
- **Tranzakció `note` mező kezelése** — A `fill_transaction_index` (`transactions/service.py`) `note or ""` kifejezést használt, ami `None`-t üres stringgé alakított; javítva `note=transaction.note`-ra, hogy az opcionális mező értéke helyes maradjon.
- **Kategória service visszatérési típus** — A `get_categories_for_user` függvény visszatérési típusa helytelenül `list[CategoryIndex]` volt (Pydantic schema), holott ORM objektumokat (`list[Categories]`) ad vissza; javítva.
- **Kategória mutációk dashboard invalidálása** — A `useCreateCategory`, `useUpdateCategory`, `useDeleteCategory` hook-ok mostantól a `queryKeys.dashboard` és `queryKeys.transactions.all` kulcsokat is invalidálják, hogy a dashboard azonnal frissüljön kategória változáskor.
- **Offline mutation queue importok** — A `useTransactions.ts`-ből hiányzott az `isOffline` és `enqueueMutation` import a `@/lib/offlineQueue` modulból; ez miatt a mentés és törlés gombok online+offline állapotban csendesen leálltak API-kérés nélkül. Javítva.
