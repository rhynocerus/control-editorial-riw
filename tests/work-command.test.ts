import { describe, it, expect } from 'vitest';
import 'fake-indexeddb/auto';
import seed from '../catalog.json';
import {validate, backup, restore, merge, fromCsv, toCsv} from '../src/model';
import {buildWorkCommand, collections} from '../src/work-command';
import {openDB, read, write} from '../src/storage';
describe('Comando editorial sin efectos secundarios',()=>{
  for (const collection of collections) for (const status of ['Publicado','Borrador','Autorizado'] as const) {
    it(`${collection}: ${status} conserva el registro`,()=>{
      const a={...validate(seed)[0],collection,status,editorialOrder:'03/41',focus:'¿Opinión? ñ 🦏',notes:'Primera\nSegunda',destination:'https://example.org/cultura/',authorizationScope:'Solo preparar',markdown:'# Texto\nContenido íntegro'};
      const before=structuredClone(a), result=buildWorkCommand(a);
      for(const v of [collection,status,'03/41','¿Opinión? ñ 🦏','https://example.org/cultura/','# Texto\nContenido íntegro']) expect(result).toContain(v);
      expect(result).toContain('solicita confirmación antes de publicar');
      expect(a).toEqual(before);
      expect(restore(backup([a]))).toEqual([a]);
      expect(fromCsv(toCsv([a]))).toEqual([a]);
    });
  }
  it('no deduce colección, orden ni destino de un registro incompleto',()=>{
    const result=buildWorkCommand(validate(seed)[0]);
    for(const field of ['Colección','Orden editorial','Destino de publicación (verificar plataforma y sitio)']) expect(result).toContain(`${field}: "NO CONSTA`);
  });
  it('acepta fechas null sin mutar ni perder imágenes, texto, notas o fechas reales',async()=>{
    const original={...seed[0], reviewedAt:null,authorizedAt:null,publishedAt:'2026-10-25', image:'data:image/png;base64,AAAA',markdown:'Texto ñ',notes:'Notas'};
    const a=validate([original]);
    expect(a).toEqual([original]); expect(restore(backup(a))).toEqual([original]);
    const db=await openDB('command-'+crypto.randomUUID()); await write(db,a,0);
    expect((await read(db))?.articles).toEqual([original]); db.close();
    expect(original.reviewedAt).toBeNull();
  });
  it('rechaza fechas corruptas sin sustituirlas por una fecha inventada',()=>{
    for(const reviewedAt of [42,{},'ayer','2026-02-30']) expect(()=>validate([{...seed[0],reviewedAt}])).toThrow();
  });
  it('preserva contexto al combinar respaldos antiguos',()=>{
    const a={...validate(seed)[0],collection:collections[2],destination:'https://example.org/'};
    expect(merge([a],validate([seed[0]]))).toEqual([a]);
  });
});
