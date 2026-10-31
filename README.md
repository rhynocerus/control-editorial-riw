# CONTROL EDITORIAL RIW · v0.1

Mesa editorial local de **RHYNUS Interactive Works** para el Cuaderno Blue Team. React + TypeScript + IndexedDB, sin backend, cuentas ni servicios de pago.

## Funciones

- Seis fichas ficticias de demostración para artículos, vídeo, pódcast, formación y comunicación.
- Dashboard, buscador por título/texto/notas/ID, filtros por categoría, estado y canal social.
- Cuatro estados exclusivos: Borrador, Revisado, Autorizado y Publicado. Fechas manuales, nunca inferidas al cambiar estado.
- Siete canales independientes: LinkedIn, Facebook, X, Threads, Instagram, YouTube y Reddit. ON, OFF y No aplica; enlaces en el panel de detalles.
- Texto completo Markdown editable con vista previa y guardado automático real. HTML sin ejecutar.
- Imagen local PNG/JPEG/WebP de hasta 5 MB, embebida en los respaldos.
- JSON completo de respaldo/restauración; importación/exportación CSV UTF-8; informe PDF del catálogo.
- Importaciones validadas y confirmadas antes de escribir. Combinación por ID o sustitución total.
- Conflictos entre pestañas detectados: se detiene el guardado y se ofrece exportar los cambios.

## Uso

1. Abre la aplicación y elige una ficha. En **Texto completo**, escribe o pega el artículo en Markdown.
2. Espera a **Guardado en este navegador** antes de cerrar la pestaña. Si aparece un error, exporta el JSON de rescate antes de cerrar.
3. Cambia estado solo cuando dispongas de evidencia. Las fechas se introducen en la ficha cuando sean conocidas.
4. En las tarjetas, pulsa un icono para recorrer OFF → ON → No aplica → OFF. En **Redes sociales**, añade el enlace de la publicación.
5. Usa **Copias y exportaciones → Descargar JSON completo** regularmente.
6. Para restaurar, importa el JSON, revisa el recuento, selecciona combinar o sustituir, respalda lo actual y confirma.

**Los datos son locales y no se sincronizan entre navegadores, perfiles o dispositivos.** En un equipo distinto, restaura manualmente el JSON. Los datos no se publican en GitHub con tus ediciones. Borrar los datos del sitio, el modo privado o la falta de espacio pueden hacerlos inaccesibles. Mantén copias externas. Abre una sola pestaña de edición.

El catálogo distribuido contiene exclusivamente ejemplos ficticios, todos en Borrador, sin fechas ni enlaces de publicaciones. No incluye el catálogo privado del titular. Los registros propios se incorporan mediante importación JSON/CSV y permanecen en ese navegador.

Actualizar el programa no elimina los registros ya guardados en IndexedDB. Antes de instalar, cambiar de dirección o sustituir datos, exporta tu JSON completo. Una instalación en otro equipo empieza con los ejemplos salvo que importes tu respaldo. El paquete `.deb` todavía no está disponible.

## Aplicaciones en otros proyectos

La misma ficha editorial puede servir para controlar contenidos de distintos proyectos afines. Estos son usos posibles del modelo actual, no módulos adicionales ya implementados:

| Proyecto | Qué registrar en cada ficha | Uso de las categorías |
| --- | --- | --- |
| Cuadernos técnicos y blogs | Artículo, imagen, revisión, URL pública y distribución social | Áreas de conocimiento o secciones |
| Divulgación y formación | Tutorial, guía o recurso educativo y sus publicaciones de difusión | Temas o bloques formativos |
| Pódcast y vídeo | Guion o notas del episodio, miniatura y enlace al contenido publicado | Series o líneas temáticas |
| Boletines y revistas digitales | Texto de una pieza, aprobación y enlace a su edición pública | Secciones editoriales |
| Comunicación de asociaciones o iniciativas culturales | Comunicado, crónica o presentación de una actividad | Programas o ámbitos de actividad |
| Portafolios y documentación pública | Presentación de un proyecto, ficha técnica y enlaces de difusión | Familias de proyectos |

Los estados y los siete canales siguen siendo los definidos en esta versión. La aplicación registra la distribución; no publica automáticamente ni recoge métricas. El PDF resume el catálogo y no sustituye al respaldo JSON.

## Preparar otro catálogo

Puedes preparar otra lista de artículos mientras se completa la validación de v0.1. Basta con una tabla con **identificador estable, título exacto y categoría**. Añade estado, texto, enlaces y fechas solo cuando se conozcan. Una lista sencilla sirve como material de preparación; para importarla debe ajustarse al formato documentado en [Modelo de datos](docs/DATOS.md), preferiblemente partiendo de una exportación de la aplicación.

- Usa identificadores distintos para cada proyecto, por ejemplo `proyecto-a-001` y `proyecto-b-001`. El ID identifica la ficha aunque cambie su título.
- Exporta el catálogo actual a JSON antes de importar otro.
- **Combinar** actualiza las fichas cuyo ID coincide y añade las nuevas; **sustituir** reemplaza el catálogo tras la confirmación.
- La versión 0.1 mantiene un catálogo activo por origen y perfil del navegador. No incluye un selector de proyectos ni espacios independientes: organiza los proyectos mediante copias JSON identificadas y conserva una copia antes de cambiar.

## Trabajar en varios dispositivos

1. En el dispositivo de origen, espera al indicador de guardado y descarga el **JSON completo**.
2. Transfiere ese archivo al dispositivo de destino mediante el medio que prefieras.
3. Abre allí la aplicación, respalda cualquier contenido existente e importa el JSON. Comprueba el recuento y algunas fichas con texto e imágenes.
4. Al terminar de editar, exporta una nueva copia para continuar en el siguiente dispositivo.

Utiliza nombres con proyecto y fecha, por ejemplo `cuaderno-blue-team-2026-10-22.json`. Evita editar simultáneamente dos copias: no hay conciliación automática y una importación puede reemplazar cambios de fichas con el mismo ID.

**GitHub conserva el código y el catálogo inicial que se incluyan en el repositorio; las ediciones realizadas en Firefox u otro navegador no se envían a GitHub.** Tampoco se transfieren automáticamente al abrir GitHub Pages. No subas respaldos con borradores o notas privadas a un repositorio público.

Un paquete **`.deb` para Linux** es una posibilidad para una versión posterior, pendiente de diseño y pruebas. No está incluido en v0.1 y no implica sincronización entre equipos. Un ejecutable para Windows u otros formatos requerirían sus propios paquetes y validación.

## Desarrollo

Requiere Node.js 22.12 o posterior.

```bash
npm ci
npm run dev
npm test
npm run build
```

La compilación estática se genera en `dist/` y usa rutas relativas para GitHub Pages. No abras `index.html` con `file://`: sirve `dist/` por HTTP(S).

## Publicación

El flujo `.github/workflows/pages.yml` ejecuta las pruebas y la compilación antes de desplegar `dist/`. Configura **Settings → Pages → Source: GitHub Actions** en el repositorio. El flujo de PR ejecuta los mismos controles sin publicar. El despliegue depende de los permisos de Pages/Actions de la cuenta. No se ha verificado una publicación remota hasta que el informe de pruebas lo indique expresamente.

## Documentación

- [Modelo de datos y formatos](docs/DATOS.md)
- [Pruebas y límites de verificación](docs/PRUEBAS.md)
- [Hoja de ruta](ROADMAP.md)
- [Propuesta de licencia para revisión](LICENSE-PROPOSAL.md)
- [Identidad y marcas](TRADEMARKS.md)
- [Contribución](CONTRIBUTING.md)

CONTROL EDITORIAL RIW – v0.1 – RIW
