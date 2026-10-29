# Botón Copiar súper comando Work

Implementado sobre feat/wordpress-tracking (665a6f8), conservando la PR #2. Main solo contiene README. No se ha modificado la instalación del usuario ni se ha iniciado otro servidor.

El botón de cada ficha genera texto con ID, categoría exacta, título, notas, estados por canal, URLs, fechas y texto existente. Los campos opcionales collection, editorialOrder, focus, destination y authorizationScope se completan desde la ficha, sin deducirlos del ID. Las tres colecciones solicitadas se ofrecen como sugerencias; no se importan ni inventan los 131 registros. Los datos ausentes se marcan NO CONSTA. La imagen se conserva en la ficha y el respaldo; el comando avisa que no la adjunta.

Copiar no escribe en IndexedDB ni cambia estados. Se espera a terminar el guardado. Se usa navigator.clipboard.writeText directamente desde el clic; si falla, se muestra texto completo seleccionable para Ctrl+C. La vista previa permite revisar todo antes de copiar. La autorización requiere evidencia y alcance, independientemente del estado Autorizado.

## reviewedAt

El JSON RIW-Control-Editorial-131-Articulos-PREIMPORTACION.json consultado tiene fechas null en registros añadidos. El validador exigía string para todas las fechas y producía Campo inválido: reviewedAt. Ahora acepta null únicamente para reviewedAt, authorizedAt y publishedAt y los conserva literalmente en JSON. La interfaz los representa vacíos. No transforma números, fechas inválidas ni cadenas arbitrarias. No se ha ejecutado ninguna importación sobre datos del usuario.

JSON sigue admitiendo versiones 1/2; los campos nuevos son opcionales, se conservan en exportación/restauración y en combinación con respaldos sin contexto. CSV incluye columnas opcionales para el contexto y sigue aceptando CSV anteriores. CSV representa fechas null como celdas vacías: usar JSON para conservar esa distinción. No abrir el nuevo respaldo con versiones antiguas para editar, porque podrían descartar campos opcionales.

## Validación 2026-10-29

32 pruebas automatizadas superadas. Cobertura: las tres colecciones con estados Publicado, Borrador y Autorizado; Unicode y texto multilínea; campos incompletos; ausencia de mutación; conservación de contexto JSON/CSV; fechas null y fechas inválidas; persistencia con fake-indexeddb; regresiones existentes. TypeScript, build y git diff --check superados.

Pendiente: portapapeles real en Firefox, copia/pegado completo, vista móvil y teclado, inspección visual y comparación del respaldo real completo antes/después. No hay Firefox instalado en el entorno. No declarar estas verificaciones superadas ni fusionar la PR como cierre definitivo.

## Aplicación en la instalación existente

Destino único: http://127.0.0.1:8080, mismo Firefox y perfil. No crear otra instancia, cambiar puerto, usar localhost como sustituto ni borrar almacenamiento.

1. En la instalación actual, exportar JSON completo y verificar que el archivo está guardado antes de modificar código. Desde el entorno de trabajo no hay acceso a la carpeta ni IndexedDB del equipo del usuario; no se ha creado un respaldo actualizado de esa instalación.
2. Identificar PID, comando, carpeta de trabajo, rama y cambios locales del servidor existente. No aplicar checkout/reset a ciegas ni asumir que la copia de GitHub incluye cambios locales.
3. Aplicar el cambio en esa carpeta tras revisar diferencias y respaldo. No incluir catálogos personales en Git.
4. Si ejecuta Vite en desarrollo, los cambios de fuentes normalmente se recargan; refrescar Firefox tras comprobar el guardado. Si sirve dist estático, reconstruir dist y refrescar normalmente basta; si sirve una copia empaquetada o conserva archivos en memoria, habrá que actualizarla y reiniciar ese mismo proceso con su comando original. No se puede determinar el caso real hasta inspeccionar el proceso.
5. Verificar recuentos, imágenes, texto, notas, fechas, WordPress y copia de comandos en borrador, publicado e incompleto. Exportar nuevo JSON y comparar. No importar para habilitar el botón.

No se ha publicado ni fusionado este cambio.
