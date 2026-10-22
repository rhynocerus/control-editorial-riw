import Papa from "papaparse";
export const statuses = [
  "Borrador",
  "Revisado",
  "Autorizado",
  "Publicado",
] as const;
export const channels = [
  "LinkedIn",
  "Facebook",
  "X",
  "Threads",
  "Instagram",
  "YouTube",
  "Reddit",
] as const;
export type Status = (typeof statuses)[number];
export type Channel = (typeof channels)[number];
export type Article = {
  id: string;
  title: string;
  category: string;
  status: Status;
  markdown: string;
  image: string;
  url: string;
  reviewedAt: string;
  authorizedAt: string;
  publishedAt: string;
  notes: string;
  social: Record<Channel, { state: "ON" | "OFF" | "NA"; url: string }>;
};
export const fields = [
  "id",
  "title",
  "category",
  "status",
  "markdown",
  "image",
  "url",
  "reviewedAt",
  "authorizedAt",
  "publishedAt",
  "notes",
  "social",
] as const;
export const safeUrl = (v: string) => {
  if (!v) return true;
  try {
    return ["https:", "http:"].includes(new URL(v).protocol);
  } catch {
    return false;
  }
};
const imagePattern =
  /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/;
export function validate(input: unknown): Article[] {
  if (!Array.isArray(input) || input.length < 1 || input.length > 5000)
    throw Error("Se requiere un catálogo de 1 a 5000 artículos.");
  const ids = new Set<string>();
  return input.map((raw: any) => {
    if (!raw || typeof raw !== "object") throw Error("Ficha inválida.");
    for (const k of fields.filter((k) => k !== "social"))
      if (typeof raw[k] !== "string") throw Error(`Campo inválido: ${k}.`);
    if (!/^[a-zA-Z0-9._-]{1,100}$/.test(raw.id) || ids.has(raw.id))
      throw Error("Identificador inválido o duplicado: " + raw.id);
    ids.add(raw.id);
    if (
      !raw.title.trim() ||
      !raw.category.trim() ||
      !statuses.includes(raw.status)
    )
      throw Error("Título, categoría o estado inválido.");
    if (!safeUrl(raw.url)) throw Error("URL pública inválida: " + raw.id);
    for (const k of ["reviewedAt", "authorizedAt", "publishedAt"])
      if (
        raw[k] &&
        (!/^\d{4}-\d{2}-\d{2}$/.test(raw[k]) ||
          new Date(raw[k]).toISOString().slice(0, 10) !== raw[k])
      )
        throw Error("Fecha inválida.");
    if (
      raw.image &&
      (raw.image.length > 7500000 || !imagePattern.test(raw.image))
    )
      throw Error("Imagen inválida; usa PNG, JPEG o WebP de hasta 5 MB.");
    if (raw.markdown.length > 5000000)
      throw Error("Texto superior a 5 millones de caracteres.");
    const social = {} as Article["social"];
    for (const c of channels) {
      const s = raw.social?.[c];
      if (
        !s ||
        !["ON", "OFF", "NA"].includes(s.state) ||
        typeof s.url !== "string" ||
        !safeUrl(s.url)
      )
        throw Error("Canal social inválido: " + c);
      social[c] = { state: s.state, url: s.url };
    }
    return Object.fromEntries([
      ...fields.filter((k) => k !== "social").map((k) => [k, raw[k]]),
      ["social", social],
    ]) as Article;
  });
}
export function backup(articles: Article[]) {
  return JSON.stringify(
    {
      format: "riw-editorial",
      version: 1,
      exportedAt: new Date().toISOString(),
      articles,
    },
    null,
    2,
  );
}
export function restore(text: string) {
  const b = JSON.parse(text);
  if (b.format !== "riw-editorial" || b.version !== 1)
    throw Error("Formato o versión de respaldo no compatible.");
  return validate(b.articles);
}
const protect = (s: string) => (/^[=+\-@\t\r\n']/.test(s) ? "'" + s : s);
const unprotect = (s: string) =>
  s.startsWith("'") && /^[=+\-@\t\r\n']/.test(s.slice(1)) ? s.slice(1) : s;
export function toCsv(a: Article[]) {
  return (
    "\uFEFF" +
    Papa.unparse(
      a.map((x) =>
        Object.fromEntries(
          fields.map((k) => [
            k,
            protect(k === "social" ? JSON.stringify(x[k]) : x[k]),
          ]),
        ),
      ),
      { columns: [...fields], newline: "\r\n" },
    )
  );
}
export function fromCsv(text: string) {
  const p = Papa.parse<Record<string, string>>(text.replace(/^\uFEFF/, ""), {
    header: true,
    skipEmptyLines: true,
  });
  if (p.errors.length || fields.some((k) => !p.meta.fields?.includes(k)))
    throw Error("CSV inválido: faltan columnas o hay errores de formato.");
  return validate(
    p.data.map((r) => {
      const x = Object.fromEntries(
        fields.map((k) => [k, unprotect(r[k] ?? "")]),
      );
      return { ...x, social: JSON.parse(x.social) };
    }),
  );
}
export function merge(current: Article[], incoming: Article[]) {
  const map = new Map(current.map((a) => [a.id, a]));
  for (const a of incoming) map.set(a.id, a);
  return validate([...map.values()]);
}
export function download(name: string, content: BlobPart, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
