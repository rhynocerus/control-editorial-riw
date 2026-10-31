import { jsPDF } from "jspdf";
import { statuses, channels, type Article } from "./model";
export function makePDF(articles: Article[]) {
  const pdf = new jsPDF();
  let y = 20;
  const line = (text: string, size = 10) => {
    pdf.setFontSize(size);
    for (const l of pdf.splitTextToSize(text, 174)) {
      if (y > 277) {
        pdf.addPage();
        y = 20;
      }
      pdf.text(l, 18, y);
      y += size * 0.46 + 2;
    }
  };
  line("CONTROL EDITORIAL RIW", 18);
  line("Resumen del catálogo · v0.1 · RHYNUS Interactive Works", 11);
  line(`Generado: ${new Date().toLocaleDateString("es-ES")}`);
  line(
    `${articles.length} artículos · ${new Set(articles.map((a) => a.category)).size} categorías`,
  );
  for (const s of statuses)
    line(`${s}: ${articles.filter((a) => a.status === s).length}`);
  y += 5;
  for (const a of articles) {
    line(`${a.id} | ${a.title}`, 11);
    line(`${a.category} | ${a.status}`);
    if (a.url) line(a.url);
    line(
      `Revisión: ${a.reviewedAt || "sin fecha"} · Autorización: ${a.authorizedAt || "sin fecha"} · Publicación: ${a.publishedAt || "sin fecha"}`,
    );
    line(
      channels
        .map(
          (c) =>
            `${c}: ${a.social[c].state === "NA" ? "No aplica" : a.social[c].state}`,
        )
        .join(" | "),
    );
    y += 4;
  }
  const pages = pdf.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    pdf.setPage(p);
    pdf.setFontSize(8);
    pdf.text(`CONTROL EDITORIAL RIW - v0.1 - RIW | ${p}/${pages}`, 18, 291);
  }
  return pdf;
}
