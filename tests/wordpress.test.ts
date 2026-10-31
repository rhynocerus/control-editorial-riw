import { describe, it, expect } from 'vitest';
import 'fake-indexeddb/auto';
import { readFileSync } from 'node:fs';
import seed from '../catalog.json';
import Papa from 'papaparse';
import { validate, restore, backup, merge, toCsv, fromCsv, wordpressStatuses } from '../src/model';
import { openDB, read, write } from '../src/storage';

describe('WordPress independiente y retrocompatible', () => {
  it('conserva exactamente todos los campos de un respaldo v1', () => {
    const original = process.env.RIW_BACKUP_TEST
      ? JSON.parse(readFileSync(process.env.RIW_BACKUP_TEST, 'utf8'))
      : { format: 'riw-editorial', version: 1, articles: seed };
    const a = restore(JSON.stringify(original));
    expect(a).toEqual(original.articles);
    expect(restore(backup(a))).toEqual(original.articles);
    if (process.env.RIW_BACKUP_TEST) {
      expect(a).toHaveLength(72);
      expect(new Set(a.map(x => x.category)).size).toBe(12);
    }
  });
  it('persiste los cuatro estados y URL sin cambiar Sites ni otros campos', async () => {
    const a = validate(seed);
    const original = structuredClone(a);
    const name = 'wp-' + crypto.randomUUID();
    let db = await openDB(name), revision = 0;
    for (const status of wordpressStatuses) {
      a[0].wordpress = { status, url: 'https://example.org/articulo' };
      revision = await write(db, a, revision);
      db.close(); db = await openDB(name);
      expect((await read(db))?.articles).toEqual(a);
      expect(restore(backup(a))).toEqual(a);
      expect(fromCsv(toCsv(a))).toEqual(a);
      const { wordpress, ...unchanged } = a[0];
      expect(unchanged).toEqual(original[0]);
    }
    db.close();
  });
  it('combinar un respaldo antiguo no borra el seguimiento WordPress', () => {
    const a = validate(seed);
    a[0].wordpress = { status: 'Publicado', url: 'https://example.org/wp' };
    expect(merge(a, validate(seed))).toEqual(a);
  });
  it('rechaza estados, estructuras y URLs de WordPress inválidos', () => {
    for (const wordpress of [null, {}, {status:'Revisado',url:''}, {status:'Publicado',url:'javascript:alert(1)'}]) {
      expect(() => validate([{...seed[0], wordpress}])).toThrow(/WordPress/);
    }
  });
  it('acepta CSV antiguo sin campo WordPress', () => {
    const csv = Papa.unparse(seed.map(x => ({...x, social: JSON.stringify(x.social)}))); 
    expect(fromCsv(csv)).toEqual(seed);
  });
  it('rechaza versiones futuras sin reinterpretarlas', () => {
    expect(() => restore(JSON.stringify({format:'riw-editorial',version:3,articles:seed}))).toThrow(/versión/);
  });
});
