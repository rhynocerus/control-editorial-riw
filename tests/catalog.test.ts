import { describe, it, expect } from "vitest";
import "fake-indexeddb/auto";
import seed from "../catalog.json";
import {
  validate,
  backup,
  restore,
  toCsv,
  fromCsv,
  merge,
  channels,
  safeUrl,
} from "../src/model";
import { openDB, read, write } from "../src/storage";
import { makePDF } from "../src/pdf";
const data = () => validate(structuredClone(seed));
describe("Catálogo y respaldo", () => {
  it("distribuye seis ejemplos ficticios con identificadores únicos", () => {
    const a = data();
    expect(a).toHaveLength(6);
    expect(new Set(a.map(a => a.id)).size).toBe(6);
    a.forEach(a => {
      expect(a.id).toMatch(/^demo-/);
      expect(a.notes).toContain("FICTICIOS");
      expect(a.status).toBe("Borrador");
      expect([a.url, a.reviewedAt, a.authorizedAt, a.publishedAt]).toEqual(["", "", "", ""]);
      channels.forEach(c => expect(a.social[c]).toEqual({state: "OFF", url: ""}));
    });
  });
  it("restaura exactamente texto largo, imagen, fechas y siete canales", () => {
    const a = data();
    a[0].markdown = "# Respaldo\n" + "Texto largo ñ 😀\n".repeat(15000);
    a[0].image =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jN6kAAAAASUVORK5CYII=";
    a[0].reviewedAt = "2026-10-21";
    channels.forEach(
      (c, i) =>
        (a[0].social[c] = {
          state: i % 2 ? "ON" : "NA",
          url: "https://example.org/" + i,
        }),
    );
    expect(restore(backup(a))).toEqual(a);
  });
  it("CSV UTF-8 reversible con comillas, saltos y fórmulas neutralizadas", () => {
    const a = data();
    a[0].markdown = '=SUM(A1)\n"hola", ñ';
    a[0].title = "'Título";
    const csv = toCsv(a);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("'=SUM");
    expect(fromCsv(csv)).toEqual(a);
  });
  it("rechaza duplicados internos sin sobrescribir", () =>
    expect(() => validate([data()[0], data()[0]])).toThrow(/duplicado/));
  it("combina por identificador estable sin duplicar", () => {
    const a = data();
    const b = structuredClone(a[0]);
    b.markdown = "Actualizado";
    expect(merge(a, [b])).toHaveLength(6);
    expect(merge(a, [b])[0].markdown).toBe("Actualizado");
  });
  it("rechaza estados, fechas, imágenes y canales inválidos", () => {
    for (const patch of [
      { status: "Listo" },
      { publishedAt: "2026-02-30" },
      { image: "https://example.org/x.png" },
      { social: {} },
    ])
      expect(() => validate([{ ...data()[0], ...patch }])).toThrow();
  });
  it("rechaza versiones desconocidas y CSV defectuoso", () => {
    expect(() =>
      restore('{"format":"riw-editorial","version":2,"articles":[]}'),
    ).toThrow();
    expect(() => fromCsv("id,title\nx,Hola")).toThrow();
  });
  it("URLs solo admiten http(s) y vacías", () => {
    for (const u of ["javascript:alert(1)", "file:///etc/passwd", "url rota"])
      expect(safeUrl(u)).toBe(false);
    expect(safeUrl("https://example.org/a?q=1")).toBe(true);
    expect(safeUrl("")).toBe(true);
  });
  it("todos los enlaces incorporados son válidos sintácticamente", () => {
    for (const a of data()) {
      expect(safeUrl(a.url)).toBe(true);
      channels.forEach((c) => expect(safeUrl(a.social[c].url)).toBe(true));
    }
  });
  it("genera PDF real paginado con el catálogo", () => {
    const rows = Array.from({length: 72}, (_, i) => ({...data()[0], id: `test-${i}`}));
    const p = makePDF(rows);
    expect(p.getNumberOfPages()).toBeGreaterThan(1);
    expect(p.output()).toContain("%PDF");
    expect(p.output()).toContain("CONTROL EDITORIAL RIW");
  });
});
describe("IndexedDB", () => {
  it("persiste estados y texto largo al cerrar y reabrir la conexión", async () => {
    const name = "persist-" + crypto.randomUUID();
    let db = await openDB(name);
    const a = data();
    await write(db, a, 0);
    for (const status of ["Revisado", "Autorizado", "Publicado"] as const) {
      a[0].status = status;
    }
    a[0].markdown = "Texto de prueba\n".repeat(20000);
    a[0].social.LinkedIn = { state: "ON", url: "https://example.org/post" };
    await write(db, a, 1);
    db.close();
    db = await openDB(name);
    expect(await read(db)).toEqual({ revision: 2, articles: a });
    db.close();
  });
  it("restauración atómica de JSON con imagen y texto en almacenamiento vacío", async () => {
    const a = data();
    a[0].markdown = "Respaldo íntegro\n".repeat(10000);
    a[0].image = "data:image/webp;base64,UklGRg==";
    const b = restore(backup(a));
    const db = await openDB("restore-" + crypto.randomUUID());
    await write(db, b, 0);
    expect((await read(db))?.articles).toEqual(a);
    db.close();
  });
  it("detecta otra pestaña y conserva la última escritura válida", async () => {
    const name = "conflict-" + crypto.randomUUID(),
      d1 = await openDB(name),
      d2 = await openDB(name);
    await write(d1, data(), 0);
    const changed = data();
    changed[0].notes = "Última edición";
    await write(d2, changed, 1);
    await expect(write(d1, data(), 1)).rejects.toThrow(/Otra pestaña/);
    expect((await read(d1))?.articles[0].notes).toBe("Última edición");
    d1.close();
    d2.close();
  });
});
