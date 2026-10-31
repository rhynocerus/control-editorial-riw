export type WorkMode = 'prepare' | 'publish';

export const workModes = {
  prepare: 'Preparar para revisión',
  publish: 'Publicar en ChatGPT Sites',
} as const;

export function workModeInstructions(mode: WorkMode): string {
  if (mode === 'publish') {
    return `OPERACIÓN SOLICITADA: PUBLICAR EN CHATGPT SITES.
Comprueba que exista autorización explícita y verificable para este artículo,
este sitio y esta operación. Si falta, no publiques y explica qué autorización
se necesita. Si está acreditada, integra el artículo en el sitio existente,
comprueba su URL pública y verifica su presencia en el índice correspondiente.
No publiques en WordPress ni LinkedIn.`;
  }

  return `OPERACIÓN SOLICITADA: PREPARAR PARA REVISIÓN.
Prepara el artículo, sus recursos visuales y los entregables editoriales.
No integres ni publiques contenido en ningún sitio o red social.`;
}
