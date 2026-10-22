# Datos y respaldo

## Origen del catálogo

Lectura puntual del proyecto Todoist **CUADERNO BLUE TEAM RIW — CHECKLIST EDITORIAL**, el 21 de octubre de 2026. Se recuperaron las 12 secciones, 71 tareas activas y una tarea completada. Los códigos editoriales `01.1` a `12.6` proporcionan los IDs estables `riw-01.1` a `riw-12.6`. No se publican IDs internos de cuentas/proyectos de Todoist, correos ni asignaciones.

La evidencia del artículo Inventario se conserva como nota: tarea completada en Todoist tras su revisión según indicación del titular, con marca temporal de completado. Esa marca no se utiliza como fecha editorial. No se han recuperado el texto ni la imagen originales del artículo. No se presume que otros artículos estén publicados.

## Ficha

| Campo                                 | Tipo y significado                                              |
| ------------------------------------- | --------------------------------------------------------------- |
| id                                    | Cadena estable única, sin espacios. No se edita en la interfaz. |
| title, category                       | Título y categoría de origen; editables.                        |
| status                                | Borrador, Revisado, Autorizado o Publicado.                     |
| markdown                              | Texto completo, hasta 5 millones de caracteres.                 |
| image                                 | Cadena vacía o data URL base64 PNG/JPEG/WebP.                   |
| url                                   | Vacía o URL http/https pública del artículo.                    |
| reviewedAt, authorizedAt, publishedAt | Fecha ISO YYYY-MM-DD o cadena vacía.                            |
| notes                                 | Notas editoriales y evidencia.                                  |
| social                                | Siete canales con state ON/OFF/NA y url http/https o vacía.     |

IndexedDB guarda un snapshot transaccional con revisión local. Las escrituras se ordenan. Una revisión incompatible de otra pestaña detiene el guardado para evitar una sobrescritura silenciosa. El JSON conserva todos los campos de las fichas; la revisión técnica no forma parte de los datos editoriales. La aplicación no garantiza recuperación después de una cuota excedida, fallo de disco o eliminación de almacenamiento: exporta antes de cerrar si el estado indica error.

## JSON v1

```json
{
  "format": "riw-editorial",
  "version": 1,
  "exportedAt": "fecha ISO de exportación",
  "articles": []
}
```

El ejemplo muestra la envoltura; la importación requiere entre 1 y 5000 fichas completas ; los archivos grandes quedan sujetos a la memoria y cuota del navegador. Rechaza IDs duplicados, columnas/campos ausentes, estados y fechas inválidos, imágenes externas y URLs con esquemas inseguros. Las imágenes se incluyen con sus bytes base64. La validación del formato no constituye una verificación criptográfica de autenticidad. La confirmación muestra cuántos IDs coinciden y permite cancelar.

Combinar actualiza cada ficha coincidente completa, incluidos campos vacíos, y añade IDs nuevos; sustituir reemplaza todas las fichas. Ambas operaciones exigen confirmación. La transacción es atómica. Si falla el guardado, el estado de la interfaz avisa y conserva la copia en memoria para exportar.

## CSV

UTF-8 con BOM, cabecera fija, comas, CRLF y escape estándar de comillas/saltos. Columnas en el orden de la tabla (social al final, como JSON). Incluye textos e imágenes. Neutraliza celdas que empiezan por `= + - @`, tabulador, salto o comilla simple, anteponiendo una comilla simple; el importador revierte exactamente este escape. Usa el exportador de esta aplicación para un viaje de ida y vuelta fiel; las modificaciones de Excel pueden alterar el formato.

**Excel limita cada celda a 32.767 caracteres.** Para textos largos e imágenes, conserva el JSON como copia principal; no confíes en guardar y reabrir el CSV en Excel para respaldar todo el contenido. No se ha probado la importación en las interfaces externas de Excel o Google Sheets.

## PDF y privacidad

PDF: resumen del catálogo, estados, fechas conocidas, URL y situación social; no incluye los textos completos ni los bytes de imágenes. No sirve para restaurar.

La aplicación no envía el catálogo a servidores propios, no conecta con Todoist ni APIs sociales, ni publica automáticamente. GitHub Pages sirve los archivos de la aplicación y puede generar sus propios registros de acceso. Abrir enlaces externos o visualizar imágenes remotas introducidas en Markdown sí puede contactar con terceros. Se recomienda incorporar la imagen principal con el selector de archivo.

Cada origen web utiliza su propia base IndexedDB. Un cambio de dominio, o pasar de la prueba local a Pages, requiere exportar e importar. La aplicación no solicita almacenamiento permanente del sistema y las cuotas dependen del navegador.
