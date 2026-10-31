import { describe, expect, it } from 'vitest';
import seed from '../catalog.json';
import { validate } from '../src/model';
import {
  createEditorialEvent,
  editorialEventLabels,
  editorialEventTypes,
  formatEditorialEventDate,
} from '../src/editorial-history';

describe('Historial editorial RIW', () => {
  it('reconoce las cinco acciones editoriales', () => {
    expect(editorialEventTypes).toHaveLength(5);

    for (const type of editorialEventTypes) {
      expect(editorialEventLabels[type]).toBeTruthy();
    }
  });

  it('crea un evento con fecha, detalle e identificador', () => {
    const now = new Date('2026-10-31T10:00:00.000Z');
    const event = createEditorialEvent(
      'review-completed',
      'Revisión técnica terminada',
      now,
    );

    expect(event.type).toBe('review-completed');
    expect(event.detail).toBe('Revisión técnica terminada');
    expect(event.at).toBe(now.toISOString());
    expect(event.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('genera identificadores distintos para eventos nuevos', () => {
    const first = createEditorialEvent('sent-to-work');
    const second = createEditorialEvent('sent-to-work');

    expect(first.id).not.toBe(second.id);
  });

  it('permite crear un evento sin detalle', () => {
    expect(createEditorialEvent('authorized').detail).toBe('');
  });

  it('presenta fechas legibles en español', () => {
    const result = formatEditorialEventDate(
      '2026-10-31T10:00:00.000Z',
    );

    expect(result).toMatch(/31.*oct.*2026/i);
  });
});

describe('Importación del historial editorial', () => {
  const article = () => structuredClone(seed[0]);

  const event = () => ({
    id: 'evento-prueba-001',
    type: 'review-completed',
    at: '2026-10-31T10:00:00.000Z',
    detail: 'Revisión ficticia',
  });

  it('acepta artículos antiguos sin historial', () => {
    const result = validate([article()]);
    expect(result[0].history).toBeUndefined();
  });

  it('conserva los eventos válidos al importar', () => {
    const result = validate([{ ...article(), history: [event()] }]);
    expect(result[0].history).toEqual([event()]);
  });

  it('rechaza identificadores de eventos duplicados', () => {
    const e = event();
    expect(() =>
      validate([{ ...article(), history: [e, { ...e }] }])
    ).toThrow(/Evento editorial inválido/);
  });

  it('rechaza tipos y fechas de eventos incorrectos', () => {
    for (const patch of [
      { type: 'accion-inexistente' },
      { at: 'fecha-invalida' },
    ]) {
      expect(() =>
        validate([{ ...article(), history: [{ ...event(), ...patch }] }])
      ).toThrow(/Evento editorial inválido/);
    }
  });
});
