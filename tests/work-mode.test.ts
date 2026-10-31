import { describe, it, expect } from 'vitest';
import seed from '../catalog.json';
import { validate } from '../src/model';
import { buildWorkCommand } from '../src/work-command';

const article = validate(seed)[0];

describe('Modalidades del Súper Comando Work v2', () => {
  it('prepara por defecto sin solicitar publicación', () => {
    const text = buildWorkCommand(article);
    expect(text).toContain('OPERACIÓN SOLICITADA: PREPARAR PARA REVISIÓN');
    expect(text).toContain('No integres ni publiques contenido');
  });

  it('permite solicitar publicación con autorización verificable', () => {
    const text = buildWorkCommand(article, 'publish');
    expect(text).toContain('OPERACIÓN SOLICITADA: PUBLICAR EN CHATGPT SITES');
    expect(text).toContain('Si falta, no publiques');
    expect(text).toContain('No publiques en WordPress ni LinkedIn');
  });

  it('exige identidad RIW e imágenes en ambas modalidades', () => {
    for (const mode of ['prepare', 'publish'] as const) {
      const text = buildWorkCommand(article, mode);
      expect(text).toContain('identidad corporativa RHYNUS Interactive Works');
      expect(text).toContain('logotipo oficial sin alteraciones');
      expect(text).toContain('una o varias imágenes editoriales pertinentes');
      expect(text).toContain('textos alternativos');
      expect(text).toContain('originales de alta calidad');
    }
  });

  it('no modifica el registro editorial', () => {
    const before = structuredClone(article);
    buildWorkCommand(article, 'prepare');
    buildWorkCommand(article, 'publish');
    expect(article).toEqual(before);
  });
});
