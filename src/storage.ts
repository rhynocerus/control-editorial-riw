import type { Article } from "./model";
export type Snapshot = { revision: number; articles: Article[] };
export function openDB(
  name = "control-editorial-riw-v1",
): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open(name, 1);
    r.onupgradeneeded = () => r.result.createObjectStore("catalog");
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    r.onblocked = () =>
      reject(Error("Cierra otras pestañas de la aplicación."));
  });
}
export function read(db: IDBDatabase): Promise<Snapshot | undefined> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("catalog", "readonly");
    const r = tx.objectStore("catalog").get("current");
    tx.oncomplete = () => resolve(r.result);
    tx.onerror = () => reject(tx.error);
  });
}
export function write(
  db: IDBDatabase,
  articles: Article[],
  expected: number,
): Promise<number> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("catalog", "readwrite");
    const s = tx.objectStore("catalog");
    let conflict = false;
    const r = s.get("current");
    r.onsuccess = () => {
      if ((r.result?.revision ?? 0) !== expected) {
        conflict = true;
        tx.abort();
        return;
      }
      s.put({ revision: expected + 1, articles }, "current");
    };
    tx.oncomplete = () => resolve(expected + 1);
    tx.onabort = () =>
      reject(
        Error(
          conflict
            ? "Otra pestaña modificó el catálogo. Exporta tus cambios y recarga antes de continuar."
            : "No se pudo guardar. Exporta tus cambios como JSON antes de cerrar.",
        ),
      );
    tx.onerror = () => reject(tx.error);
  });
}
