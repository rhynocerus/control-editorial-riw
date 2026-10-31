# Informe de verificación · v0.1

Fecha: 21 de octubre de 2026. Entorno local de desarrollo; no equivale a una comprobación de la aplicación publicada.

## Automatizado

`npm run build`: TypeScript y compilación de Vite superados.

`npm test`: **14 pruebas superadas** en Vitest. IndexedDB se prueba con fake-indexeddb; estas pruebas no sustituyen la comprobación del navegador real.

| Comprobación | Resultado |
| --- | --- |
| Catálogo real de Todoist | 72 fichas únicas, 12 categorías, seis por categoría. |
| Estado inicial y ejemplo | 71 borradores, un publicado; sin fechas editoriales inventadas ni publicaciones sociales supuestas. |
| JSON | Ida y vuelta con texto largo, imagen base64, fechas y siete canales. |
| CSV | UTF-8 BOM; recuperación exacta de comillas, saltos, acentos y escapes contra fórmulas. |
| Identificadores | Rechazo de duplicados internos y combinación sin duplicar fichas. |
| Validación | Rechazo de estados, fechas, imágenes/formato, canales, versiones y CSV inválidos. |
| URLs | Comprobación sintáctica, esquemas http/https y rechazo de esquemas inseguros. |
| PDF | Generación de bytes PDF válidos y varias páginas con el catálogo. |
| IndexedDB | Escritura y recuperación de texto largo/estado/social tras cerrar y reabrir la conexión. |
| Restauración | Escritura atómica de un respaldo en una base vacía. |
| Varias pestañas | Rechazo de una escritura con revisión obsoleta, sin sobrescribir la última copia válida. |

`npm audit --omit=dev`: cero vulnerabilidades conocidas comunicadas por el registro en esta ejecución. No constituye una auditoría de seguridad completa.

## Comprobaciones en Chrome

- Carga visual de las 72 fichas y el logotipo oficial.
- Cambio de Borrador a Revisado, Autorizado y Publicado, con un único estado seleccionado.
- Guardado de un texto Markdown de **192.026 caracteres**, con acentos y saltos de línea.
- Recuperación del texto completo y del estado al cerrar la pestaña y abrir una nueva en el mismo navegador.
- LinkedIn en ON con URL sintética; Reddit en No aplica.
- Incorporación de una imagen PNG válida de 1.030.547 bytes y visualización en la ficha.
- Descarga JSON con 72 fichas, texto completo y una imagen embebida de 1.374.086 caracteres.
- Modificación del texto después del respaldo; importación del JSON, confirmación explícita y sustitución; recuperación de **192.026 caracteres**, imagen visible y estados ON/No aplica.
- Descarga real de CSV UTF-8 con BOM.
- Diseño de escritorio y marco móvil de 390 × 844 píxeles inspeccionados visualmente. No se ha probado en un teléfono físico.
- Los datos de prueba se mantienen fuera del catálogo distribuido.

## Límites y comprobaciones pendientes

- **PDF en navegador:** se genera el enlace al Blob del PDF, pero la automatización no capturó su descarga. La apertura para inspección fue bloqueada por la política del navegador de pruebas, que no permite observar URLs `blob:`. No se declara superada la descarga/renderización del PDF en navegador. Debe verificarse antes del cierre de publicación. No se intentó eludir el bloqueo.
- **Reinicio completo del navegador:** se comprobó el cierre y reapertura de pestaña y de la conexión IndexedDB, pero no terminar el proceso de Chrome y reiniciarlo. Esa prueba permanece pendiente.
- **URL pública de referencia:** el verificador web no pudo acceder a la página. La URL se conserva exactamente como la proporcionó el titular y supera la validación sintáctica; su respuesta HTTP y contenido actual no están comprobados en esta ejecución.
- **Imágenes:** carga y restauración de PNG comprobadas; JPEG/WebP están admitidos y se decodifican al incorporar/importar, pero no se han probado manualmente los tres formatos.
- **CSV en Excel/Sheets:** formato comprobado mediante análisis e ida y vuelta, sin abrir esas aplicaciones. Excel limita los caracteres por celda: usar JSON para respaldar textos largos/imágenes.
- **GitHub:** identidad `rhynocerus` confirmada por el conector. La consulta del repositorio previsto devolvió 404. El conector no expone crear repositorios ni configurar Pages. La interfaz web mostró una pantalla de inicio de sesión.
- **Ciclo Git remoto:** push, PR, CI remota, merge y cierre no realizados. La rama local `feat/v0.1` conserva el objetivo activo.
- **Despliegue y URL pública de la aplicación:** no realizados ni verificados. El workflow está preparado, pero no se ha ejecutado en GitHub.

## Revisión del material público

El catálogo distribuido incluye solo títulos/categorías, estados conservadores y notas editoriales de procedencia. No incluye los datos completos de Todoist, correos, asignaciones, secretos ni los archivos de pruebas manuales. Los archivos locales de copias de prueba, capturas, node_modules y metadatos de acceso quedan fuera de la entrega del código. Los cuerpos y las imágenes originales de artículos no se han recuperado ni inventado.

No declarar cerrado el objetivo v0.1 hasta completar las comprobaciones pendientes y verificar la URL publicada.

## Continuación del 22 de octubre de 2026

Repositorio público confirmado y código publicado mediante el conector en `feat/v0.1`, commit `4baaf25d6f13799403548133380b98163c860420`. PR #1 abierta en borrador: https://github.com/rhynocerus/control-editorial-riw/pull/1. GitHub Actions ha iniciado la ejecución 39739194389. El resultado se registrará cuando termine. Estas evidencias sustituyen el estado anterior de Git remoto pendiente; Pages continúa sin publicar.

## Cambio del catálogo distribuido · 22 de octubre de 2026

Las comprobaciones anteriores corresponden al catálogo original, retirado de la distribución por privacidad. La distribución actual usa seis ejemplos ficticios. El historial remoto antiguo todavía puede contener el catálogo anterior; sustituir archivos actuales no lo elimina. Se repiten las pruebas automatizadas y la compilación para el catálogo de demostración. No se ha generado un `.deb`.
