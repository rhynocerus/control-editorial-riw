import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import Markdown from "react-markdown";
import {
  siFacebook,
  siX,
  siThreads,
  siInstagram,
  siYoutube,
  siReddit,
} from "simple-icons";
import seed from "../catalog.json";
import {
  statuses,
  wordpressStatuses,
  emptyWordPress,
  type WordPress,
  channels,
  validate,
  backup,
  restore,
  toCsv,
  fromCsv,
  merge,
  download,
  safeUrl,
  type Article,
  type Channel,
} from "./model";
import { openDB, read, write } from "./storage";
import "./style.css";
import { WorkCommand } from "./WorkCommand";
const socialIcons: Partial<Record<Channel, { path: string }>> = {
  Facebook: siFacebook,
  X: siX,
  Threads: siThreads,
  Instagram: siInstagram,
  YouTube: siYoutube,
  Reddit: siReddit,
};
function Icon({ channel }: { channel: Channel }) {
  return channel === "LinkedIn" ? (
    <span className="linkedin" aria-hidden="true">
      in
    </span>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d={socialIcons[channel]?.path} />
    </svg>
  );
}
function ValidInput({
  value,
  onCommit,
  kind = "text",
}: {
  value: string;
  onCommit: (s: string) => void;
  kind?: "text" | "url";
}) {
  const [draft, setDraft] = useState(value),
    [invalid, setInvalid] = useState(false);
  useEffect(() => setDraft(value), [value]);
  return (
    <>
      <input
        type={kind}
        value={draft}
        aria-invalid={invalid}
        onChange={(e) => {
          setDraft(e.target.value);
          const v = e.target.value;
          const ok = kind === "url" ? safeUrl(v) : !!v.trim();
          setInvalid(!ok);
          if (ok) onCommit(v);
        }}
        onBlur={() => {
          if (invalid) {
            setDraft(value);
            setInvalid(false);
          }
        }}
      />
      {invalid && (
        <small role="status">
          {kind === "url"
            ? "Completa una URL http(s) válida."
            : "El título no puede estar vacío."}{" "}
          Se conserva el último valor válido.
        </small>
      )}
    </>
  );
}
function App() {
  const [articles, setArticles] = useState<Article[]>([]),
    [selected, setSelected] = useState(""),
    [category, setCategory] = useState(""),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState(""),
    [channel, setChannel] = useState(""),
    [socialFilter, setSocialFilter] = useState("OFF"),
    [tab, setTab] = useState("Ficha"),
    [saved, setSaved] = useState("Abriendo almacenamiento…"),
    [error, setError] = useState(""),
    [imported, setImported] = useState<Article[] | null>(null),
    [mode, setMode] = useState("merge"),
    [backupPanel, setBackupPanel] = useState(false),
    [ready, setReady] = useState(false),
    [pdfUrl, setPdfUrl] = useState("");
  useEffect(() => {
    if (!selected && !imported) return;
    const previous = document.activeElement as HTMLElement;
    const handler = (e: KeyboardEvent) => {
      const dialogs = document.querySelectorAll<HTMLElement>('[role="dialog"]');
      const d = dialogs[dialogs.length - 1];
      if (!d) return;
      if (e.key === "Escape") {
        setSelected("");
        setImported(null);
      }
      if (e.key === "Tab") {
        const nodes = [
          ...d.querySelectorAll<HTMLElement>(
            "button:not(:disabled),input:not(:disabled),select,textarea,a[href]",
          ),
        ].filter((n) => n.offsetParent !== null);
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            !d.contains(document.activeElement))
        ) {
          e.preventDefault();
          last?.focus();
        } else if (
          !e.shiftKey &&
          (document.activeElement === last ||
            !d.contains(document.activeElement))
        ) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = old;
      previous?.focus();
    };
  }, [!!selected, !!imported]);
  const db = useRef<IDBDatabase | null>(null),
    revision = useRef(0),
    queue = useRef(Promise.resolve()),
    pending = useRef(0),
    failed = useRef(false),
    latest = useRef<Article[]>([]),
    imageVersion = useRef(0);
  useEffect(() => {
    let alive = true;
    openDB()
      .then(async (d) => {
        db.current = d;
        const existing = await read(d);
        const data = existing ? validate(existing.articles) : validate(seed);
        revision.current = existing?.revision ?? 0;
        if (!existing) revision.current = await write(d, data, 0);
        if (alive) {
          latest.current = data;
          setArticles(data);
          setReady(true);
          setSaved("Guardado en este navegador");
        }
      })
      .catch((e) => {
        setError(String(e));
        setSaved("Almacenamiento no disponible");
      });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    const f = (e: BeforeUnloadEvent) => {
      if (pending.current || failed.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", f);
    return () => window.removeEventListener("beforeunload", f);
  }, []);
  function persist(next: Article[]) {
    latest.current = next;
    setArticles(next);
    pending.current++;
    setSaved("Guardando…");
    queue.current = queue.current
      .then(async () => {
        if (failed.current)
          throw Error("Guardado detenido; exporta el JSON antes de cerrar.");
        revision.current = await write(db.current!, next, revision.current);
      })
      .catch((e) => {
        failed.current = true;
        setError(String(e));
      })
      .finally(() => {
        pending.current--;
        setSaved(
          failed.current
            ? "Error de guardado: exporta tus cambios"
            : pending.current
              ? "Guardando…"
              : "Guardado en este navegador",
        );
      });
  }
  const article = articles.find((a) => a.id === selected);
  const update = (patch: Partial<Article>, id = selected) =>
    persist(latest.current.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  const categories = [...new Set(articles.map((a) => a.category))].sort();
  const visible = articles.filter(
    (a) =>
      (!category || a.category === category) &&
      (!status || a.status === status) &&
      (!channel || a.social[channel as Channel].state === socialFilter) &&
      `${a.title} ${a.id} ${a.markdown} ${a.notes}`
        .toLocaleLowerCase("es")
        .includes(query.toLocaleLowerCase("es")),
  );
  function social(a: Article, c: Channel) {
    const states = ["OFF", "ON", "NA"] as const;
    update(
      {
        social: {
          ...a.social,
          [c]: {
            ...a.social[c],
            state: states[(states.indexOf(a.social[c].state) + 1) % 3],
          },
        },
      },
      a.id,
    );
  }
  useEffect(() => {
    setPdfUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return "";
    });
  }, [articles]);
  async function importFile(file?: File) {
    if (!file) return;
    try {
      const text = await file.text();
      const incoming = file.name.toLowerCase().endsWith(".csv")
        ? fromCsv(text)
        : restore(text);
      for (const data of new Set(
        incoming.map((a) => a.image).filter(Boolean),
      )) {
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () =>
            reject(Error("El respaldo contiene una imagen dañada."));
          img.src = data;
        });
      }
      setImported(incoming);
      setError("");
    } catch (e) {
      setError(String(e));
    }
  }
  async function image(file?: File) {
    if (!file || !article) return;
    const id = article.id,
      version = ++imageVersion.current;
    try {
      if (
        !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
        file.size > 5 * 1024 * 1024
      )
        throw Error("Usa PNG, JPEG o WebP de hasta 5 MB.");
      const value = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject(Error("No se pudo leer la imagen"));
        r.readAsDataURL(file);
      });
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(Error("Imagen dañada"));
        img.src = value;
      });
      if (version === imageVersion.current) update({ image: value }, id);
    } catch (e) {
      setError(String(e));
    }
  }
  const label = (c: Channel, a: Article) =>
    `${c}: ${a.social[c].state === "NA" ? "No aplica" : a.social[c].state}. Pulsar para cambiar.`;
  return (
    <>
      <header>
        <div className="brand">
          <img
            src={import.meta.env.BASE_URL + "riw-logo.png"}
            alt="RHYNUS Interactive Works"
          />
          <div>
            <small>RIW / HERRAMIENTAS EDITORIALES</small>
            <h1>
              CONTROL EDITORIAL <em>RIW</em>
            </h1>
          </div>
        </div>
        <button onClick={() => setBackupPanel(!backupPanel)}>
          ↥ Copias y exportaciones
        </button>
      </header>
      <div className="local">
        <span className="dot" /> Almacenamiento local · Sin cuentas ni
        sincronización entre dispositivos <span role="status">{saved}</span>
      </div>
      {error && (
        <div className="error" role="alert">
          {error}
          <button onClick={() => setError("")}>Cerrar aviso</button>
          <button
            onClick={() =>
              download(
                "riw-rescate.json",
                backup(latest.current),
                "application/json",
              )
            }
          >
            Exportar cambios JSON
          </button>
        </div>
      )}
      {backupPanel && (
        <section className="backup">
          <div>
            <small>PROTEGE TU TRABAJO</small>
            <h2>Respaldo y transferencia</h2>
            <p>
              El JSON incluye textos completos e imágenes. Descárgalo con
              regularidad; borrar los datos del navegador elimina tu catálogo
              local.
            </p>
          </div>
          <div className="actions">
            <button
              disabled={!ready}
              onClick={() =>
                download(
                  "control-editorial-riw.json",
                  backup(articles),
                  "application/json",
                )
              }
            >
              Descargar JSON completo
            </button>
            <button
              disabled={!ready}
              onClick={() =>
                download(
                  "control-editorial-riw.csv",
                  toCsv(articles),
                  "text/csv;charset=utf-8",
                )
              }
            >
              Exportar CSV UTF-8
            </button>
            <button
              disabled={!ready}
              onClick={async () => {
                try {
                  const { makePDF } = await import("./pdf");
                  if (pdfUrl) URL.revokeObjectURL(pdfUrl);
                  setPdfUrl(
                    URL.createObjectURL(makePDF(latest.current).output("blob")),
                  );
                } catch (e) {
                  setError("No se pudo generar el PDF: " + String(e));
                }
              }}
            >
              Preparar informe PDF
            </button>
            {pdfUrl && (
              <a
                className="button"
                href={pdfUrl}
                download="control-editorial-riw.pdf"
              >
                Descargar PDF preparado
              </a>
            )}
            {pdfUrl && (
              <a
                className="button"
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
              >
                Abrir PDF
              </a>
            )}
            <label className="button">
              Importar JSON / CSV
              <input
                disabled={!ready}
                type="file"
                accept=".json,.csv"
                onChange={(e) => {
                  void importFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          <p className="muted">
            JSON es la copia de restauración recomendada. El CSV incluye todos
            los campos, pero Excel limita las celdas a 32.767 caracteres. El PDF
            es un resumen, no un respaldo. Las copias pueden contener tu
            contenido privado: guárdalas con cuidado.
          </p>
        </section>
      )}
      <main>
        <aside>
          <small>CATÁLOGO / BLUE TEAM</small>
          <button
            className={!category ? "active" : ""}
            onClick={() => setCategory("")}
          >
            Todas las categorías <b>{articles.length}</b>
          </button>
          {categories.map((c) => (
            <button
              key={c}
              className={category === c ? "active" : ""}
              onClick={() => setCategory(c)}
            >
              {c}
              <b>{articles.filter((a) => a.category === c).length}</b>
            </button>
          ))}
          <div className="aside-note">
            Tu mesa de edición.
            <br />
            Del primer borrador a la publicación.
          </div>
        </aside>
        <div className="workspace">
          <div className="heading">
            <div>
              <small>VISTA GENERAL</small>
              <h2>
                El próximo artículo empieza aquí<span>_</span>
              </h2>
              <p className="muted">
                Organiza, revisa y conserva las colecciones editoriales RIW.
              </p>
            </div>
            <span className="version">v0.1 / LOCAL</span>
          </div>
          <section className="stats" aria-label="Estadísticas">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(status === s ? "" : s)}
                className={status === s ? "active" : ""}
              >
                <span>{s}</span>
                <strong>
                  {articles
                    .filter((a) => a.status === s)
                    .length.toString()
                    .padStart(2, "0")}
                </strong>
                <progress
                  max={articles.length || 1}
                  value={articles.filter((a) => a.status === s).length}
                />
              </button>
            ))}
          </section>
          <div className="progress">
            <span>Progreso de publicación</span>
            <progress
              value={articles.filter((a) => a.status === "Publicado").length}
              max={articles.length || 1}
            />
            <b>
              {articles.length
                ? Math.round(
                    (articles.filter((a) => a.status === "Publicado").length /
                      articles.length) *
                      100,
                  )
                : 0}
              %
            </b>
          </div>
          <section className="filters" aria-label="Buscar y filtrar">
            <label className="search">
              Buscar
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Título, texto o identificador…"
                type="search"
              />
            </label>
            <label>
              Estado
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Todos los estados</option>
                {statuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              Red social
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
              >
                <option value="">Todas las redes</option>
                {channels.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            {channel && (
              <label>
                Distribución
                <select
                  value={socialFilter}
                  onChange={(e) => setSocialFilter(e.target.value)}
                >
                  <option>OFF</option>
                  <option>ON</option>
                  <option value="NA">No aplica</option>
                </select>
              </label>
            )}
          </section>
          <div className="list-heading">
            <h3>{category || "Todos los artículos"}</h3>
            <span>{visible.length} resultados</span>
          </div>
          <div className="cards">
            {visible.map((a) => (
              <article className="card" key={a.id}>
                <button
                  className="open-card"
                  onClick={() => {
                    setSelected(a.id);
                    setTab("Ficha");
                  }}
                  aria-label={"Editar " + a.title}
                >
                  <div className="thumbnail">
                    {a.image ? (
                      <img src={a.image} alt="Miniatura editorial" />
                    ) : (
                      <div className="placeholder">
                        <span>RIW / EDITORIAL</span>
                        <b>{a.id.replace("riw-", "")}</b>
                        <small>Sin imagen incorporada</small>
                      </div>
                    )}
                    <span className={"badge " + a.status.toLowerCase()}>
                      {a.status}
                    </span>
                  </div>
                  <div className="card-text">
                    <small>{a.category}</small>
                    <h3>{a.title}</h3>
                    <span className="muted">
                      {a.markdown
                        ? `${a.markdown.length.toLocaleString("es")} caracteres`
                        : "Texto pendiente de incorporar"}{" "}
                      <span aria-hidden="true">↗</span>
                    </span>
                  </div>
                </button>
                <div className="socials">
                  {channels.map((c) => (
                    <button
                      key={c}
                      title={label(c, a)}
                      aria-label={label(c, a)}
                      className={a.social[c].state.toLowerCase()}
                      onClick={() => social(a, c)}
                    >
                      <Icon channel={c} />
                      <small>
                        {a.social[c].state === "NA" ? "N/A" : a.social[c].state}
                      </small>
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
          {ready && !visible.length && (
            <p className="empty">No hay artículos con estos filtros.</p>
          )}
        </div>
      </main>
      <footer>
        CONTROL EDITORIAL RIW – v0.1 – RIW{" "}
        <span>
          RHYNUS Interactive Works · Tus contenidos permanecen en este navegador
        </span>
      </footer>
      {article && (
        <div className="overlay">
          <section
            className="editor"
            role="dialog"
            aria-modal="true"
            aria-labelledby="editor-title"
          >
            <div className="editor-head">
              <div>
                <small>{article.id} / EDICIÓN LOCAL</small>
                <h2 id="editor-title">{article.title}</h2>
              </div>
              <button
                autoFocus
                aria-label="Cerrar ficha"
                onClick={() => setSelected("")}
              >
                ✕
              </button>
            </div>
            <div className="state-row" aria-label="Estado en ChatGPT Sites">
              {statuses.map((s) => (
                <button
                  key={s}
                  className={article.status === s ? "active" : ""}
                  aria-pressed={article.status === s}
                  onClick={() => update({ status: s })}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="muted state-help">
              {
                {
                  Borrador: "Contenido en preparación.",
                  Revisado: "Contenido y recursos comprobados.",
                  Autorizado: "Requiere comprobar el alcance concreto de la autorización.",
                  Publicado: "Artículo disponible públicamente.",
                }[article.status]
              }{" "}
              Cambiar el estado no inventa fechas ni evidencias.
            </p>
            <WorkCommand key={article.id} article={article} update={update} disabled={!!pending.current || failed.current} />
            <nav className="tabs" aria-label="Paneles de ficha">
              {["Ficha", "Texto completo", "Redes sociales", "WordPress"].map((t) => (
                <button
                  key={t}
                  className={tab === t ? "active" : ""}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </nav>
            {tab === "WordPress" && (
              <div className="form-grid">
                <p className="wide muted">Seguimiento local. No publica ni crea borradores en WordPress.</p>
                <label>
                  Estado en WordPress
                  <select
                    value={(article.wordpress ?? emptyWordPress).status}
                    onChange={(e) => update({ wordpress: {
                      ...(article.wordpress ?? emptyWordPress),
                      status: e.target.value as WordPress["status"],
                    } })}
                  >
                    {wordpressStatuses.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </label>
                <label className="wide">
                  URL en WordPress
                  <ValidInput
                    kind="url"
                    value={(article.wordpress ?? emptyWordPress).url}
                    onCommit={(url) => update({ wordpress: {
                      ...(article.wordpress ?? emptyWordPress), url,
                    } })}
                  />
                  {article.wordpress?.url && (
                    <a href={article.wordpress.url} target="_blank" rel="noreferrer">Abrir en WordPress ↗</a>
                  )}
                </label>
              </div>
            )}
            {tab === "Ficha" && (
              <div className="form-grid">
                <label>
                  Título
                  <ValidInput
                    value={article.title}
                    onCommit={(title) => update({ title })}
                  />
                </label>
                <label>
                  Categoría
                  <select
                    value={article.category}
                    onChange={(e) => update({ category: e.target.value })}
                  >
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label className="wide">
                  URL pública en ChatGPT Sites
                  <ValidInput
                    kind="url"
                    value={article.url}
                    onCommit={(url) => update({ url })}
                  />
                  {article.url && (
                    <a
                      href={
                        /^https?:\/\//.test(article.url)
                          ? article.url
                          : undefined
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      Abrir artículo ↗
                    </a>
                  )}
                </label>
                <div className="dates wide">
                  {(
                    [
                      ["reviewedAt", "Revisión"],
                      ["authorizedAt", "Autorización"],
                      ["publishedAt", "Publicación"],
                    ] as const
                  ).map(([k, l]) => (
                    <label key={k}>
                      {l}
                      <input
                        type="date"
                        value={article[k] ?? ""}
                        onChange={(e) => update({ [k]: e.target.value })}
                      />
                    </label>
                  ))}
                </div>
                <label className="wide">
                  Notas editoriales
                  <textarea
                    rows={4}
                    value={article.notes}
                    onChange={(e) => update({ notes: e.target.value })}
                  />
                </label>
                <div className="wide image-editor">
                  {article.image && (
                    <img src={article.image} alt="Imagen principal" />
                  )}
                  <label className="button">
                    Incorporar imagen
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => {
                        void image(e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {article.image && (
                    <button
                      onClick={() => {
                        imageVersion.current++;
                        update({ image: "" });
                      }}
                    >
                      Quitar imagen
                    </button>
                  )}
                  <small>
                    PNG, JPEG o WebP · máximo 5 MB. Incluida en el respaldo
                    JSON.
                  </small>
                </div>
              </div>
            )}
            {tab === "Texto completo" && (
              <div className="text-panel">
                <p className="muted">
                  Markdown · Guardado automático.{" "}
                  {article.markdown.length.toLocaleString("es")} caracteres. La
                  vista previa no ejecuta HTML.
                </p>
                <div className="text-columns">
                  <label>
                    Texto del artículo
                    <textarea
                      className="markdown-input"
                      maxLength={5000000}
                      value={article.markdown}
                      placeholder="# Título del artículo\n\nEscribe o pega aquí el texto completo…"
                      onChange={(e) => update({ markdown: e.target.value })}
                    />
                  </label>
                  <section className="preview">
                    <h3>Vista previa</h3>
                    <Markdown skipHtml>
                      {article.markdown ||
                        "*Aún no se ha incorporado el texto completo.*"}
                    </Markdown>
                  </section>
                </div>
              </div>
            )}
            {tab === "Redes sociales" && (
              <div className="network-panel">
                <p className="muted">
                  ON: publicado · OFF: pendiente · No aplica: canal descartado.
                  No se publica automáticamente.
                </p>
                {channels.map((c) => (
                  <div key={c} className="network-row">
                    <span>
                      <Icon channel={c} />
                      {c}
                    </span>
                    <label>
                      Estado
                      <select
                        value={article.social[c].state}
                        onChange={(e) =>
                          update({
                            social: {
                              ...article.social,
                              [c]: {
                                ...article.social[c],
                                state: e.target.value as "ON" | "OFF" | "NA",
                              },
                            },
                          })
                        }
                      >
                        <option>OFF</option>
                        <option>ON</option>
                        <option value="NA">No aplica</option>
                      </select>
                    </label>
                    <label>
                      Enlace directo
                      <ValidInput
                        kind="url"
                        value={article.social[c].url}
                        onCommit={(url) =>
                          update({
                            social: {
                              ...article.social,
                              [c]: { ...article.social[c], url },
                            },
                          })
                        }
                      />
                    </label>
                  </div>
                ))}
              </div>
            )}
            <div className="editor-bottom">
              <span role="status">{saved}</span>
              <button onClick={() => setSelected("")}>
                Volver al catálogo
              </button>
            </div>
          </section>
        </div>
      )}
      {imported && (
        <div className="overlay">
          <section
            className="import-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="import-title"
          >
            <h2 id="import-title">Confirmar importación</h2>
            <p>
              Validación superada: {imported.length} artículos. Coinciden{" "}
              {
                imported.filter((a) => articles.some((b) => a.id === b.id))
                  .length
              }{" "}
              identificadores con tu catálogo.
            </p>
            <label>
              Operación
              <select value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="merge">
                  Combinar: actualizar coincidencias y añadir nuevas fichas
                </option>
                <option value="replace">
                  Sustituir todo el catálogo local
                </option>
              </select>
            </label>
            <p>
              Se sobrescribirán los campos de las fichas coincidentes. Descarga
              primero una copia de tus datos actuales.
            </p>
            <button
              onClick={() =>
                download(
                  "riw-antes-importacion.json",
                  backup(articles),
                  "application/json",
                )
              }
            >
              Respaldar catálogo actual
            </button>
            <div className="actions">
              <button autoFocus onClick={() => setImported(null)}>
                Cancelar
              </button>
              <button
                className="primary"
                onClick={() => {
                  try {
                    download("riw-antes-importacion.json", backup(latest.current), "application/json");
                    persist(
                      mode === "replace"
                        ? imported
                        : merge(latest.current, imported),
                    );
                    setImported(null);
                    setSelected("");
                  } catch (e) {
                    setError(String(e));
                  }
                }}
              >
                Confirmar e importar
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
