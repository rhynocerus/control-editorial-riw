# Seguimiento local de WordPress

La ficha añade una pestaña WordPress con estado (Pendiente, Borrador, Preparado o Publicado) y URL HTTP(S) opcional. No accede a WordPress ni requiere credenciales. Los campos existentes de estado, URL y fechas siguen correspondiendo a ChatGPT Sites.

## Datos y compatibilidad

Cada artículo mantiene su identificador y registro. El campo opcional `wordpress: { status, url }` solo se escribe al editarlo. Su ausencia se muestra como Pendiente, sin reescribir el catálogo al abrirlo. No cambia el nombre ni la versión de IndexedDB y no se modifica el catálogo distribuido.

JSON exporta versión 2 y restaura versiones 1 y 2. Una versión antigua de la aplicación no debe usarse para editar datos que ya tengan seguimiento WordPress. CSV añade una columna opcional `wordpress` y sigue leyendo CSV antiguos. Al combinar por ID, un respaldo sin ese campo conserva el seguimiento existente. Sustituir el catálogo sigue siendo una restauración completa; primero se descarga automáticamente el respaldo actual. El usuario debe verificar que la descarga se haya guardado antes de continuar con una actualización local.

## Actualización local (intervención del usuario)

1. En la aplicación actual, exportar JSON y comprobar que quedó guardado. No borrar datos de Firefox.
2. Confirmar la ruta, rama y cambios locales del proyecto antes de aplicar la rama de esta PR. No usar reset ni sustituir archivos locales sin revisarlos.
3. Conservar el mismo navegador, perfil y origen exacto `http://127.0.0.1:8080`. `localhost` y otros puertos tienen almacenamiento diferente.
4. Instalar y compilar el código actualizado en el equipo del usuario. Reiniciar su servidor solo cuando corresponda y recargar la pestaña tras terminar la actualización. No hace falta importar JSON para habilitar WordPress.
5. Comprobar 72 artículos y 12 categorías, editar WordPress en una ficha, cerrar y abrir la ficha, recargar y verificar persistencia y estado independiente de Sites. Exportar un nuevo JSON.

No se ha modificado ni desplegado nada en el equipo del usuario. La PR parte de `feat/v0.1`, porque `main` solo contiene README; no incorpora ni publica el respaldo personal.

## Validación

- 19 pruebas automatizadas, incluida restauración del respaldo real suministrado (72 artículos y 12 categorías), igualdad de todos sus campos originales y exportación/restauración JSON.
- Cuatro estados WordPress y URL conservados al cerrar y reabrir IndexedDB de prueba; JSON/CSV reversibles; rechazo de estados y URLs inválidos; combinación con respaldo antiguo conserva WordPress.
- TypeScript y compilación de producción completados.
- Ejecutar la comprobación privada opcional con `RIW_BACKUP_TEST=/ruta/al/respaldo.json npm test`. El archivo personal nunca debe añadirse a Git.
