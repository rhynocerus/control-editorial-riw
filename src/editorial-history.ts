export const editorialEventTypes = [
  'sent-to-work',
  'review-completed',
  'authorized',
  'published',
  'returned-for-correction',
] as const;

export type EditorialEventType =
  (typeof editorialEventTypes)[number];

export type EditorialEvent = {
  id: string;
  type: EditorialEventType;
  at: string;
  detail: string;
};

export const editorialEventLabels: Record<EditorialEventType, string> = {
  'sent-to-work': 'Enviado a Work',
  'review-completed': 'Revisión completada',
  'authorized': 'Autorizado',
  'published': 'Publicado',
  'returned-for-correction': 'Devuelto a corrección',
};

export function createEditorialEvent(
  type: EditorialEventType,
  detail = '',
  now = new Date(),
): EditorialEvent {
  return {
    id: crypto.randomUUID(),
    type,
    at: now.toISOString(),
    detail,
  };
}

export function formatEditorialEventDate(at: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(new Date(at));
}
