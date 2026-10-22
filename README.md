# CONTROL EDITORIAL RIW · v0.1

Mesa editorial local de **RHYNUS Interactive Works** para el Cuaderno Blue Team. React + TypeScript + IndexedDB, sin backend, cuentas ni servicios de pago.

## Funciones

- 72 títulos reales recuperados de Todoist, organizados en 12 categorías de seis artículos.
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

El catálogo inicial contiene títulos, categorías y notas de procedencia, no los cuerpos ni las imágenes de los 72 artículos. Solo «Inventario de dispositivos: no puedes proteger lo que desconoces» comienza en Publicado por la evidencia aportada. Las otras 71 fichas comienzan en Borrador, con publicación por comprobar. Redes OFF y fechas vacías. El estado inicial no constituye una auditoría del sitio publicado.

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
