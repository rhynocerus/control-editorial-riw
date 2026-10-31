import React, { useState } from 'react';
import { type Article, commandFields, safeUrl } from './model';
import { buildWorkCommand, collections } from './work-command';
import { workModes, type WorkMode } from './work-mode';
const labels = {collection:'Colección exacta', editorialOrder:'Orden editorial', focus:'Enfoque', destination:'URL del sitio de destino', authorizationScope:'Alcance y evidencia de autorización'};
export function WorkCommand({article, update, disabled}: {article:Article; update:(patch:Partial<Article>)=>void; disabled:boolean}) {
  const [mode,setMode]=useState<WorkMode>('prepare');
  const [message,setMessage]=useState('');
  const [manual,setManual]=useState('');
  const command=buildWorkCommand(article, mode);
  async function copy() {
    setMessage(''); setManual('');
    try {
      if (!navigator.clipboard?.writeText) throw Error('Portapapeles no disponible');
      await navigator.clipboard.writeText(command);
      setMessage('Comando completo copiado. El estado del artículo no cambió.');
    } catch {
      setManual(command);
      setMessage('No se pudo copiar automáticamente. Selecciona el texto completo y usa Ctrl+C.');
    }
  }
  return <section className="work-command" aria-label="Comando editorial Work">
    <div className="work-mode-compact">
      <span className="work-mode-title">Operación para Work:</span>
      <label>
        <input type="radio" name="work-mode" value="prepare"
          disabled={disabled}
          checked={mode === 'prepare'}
          onChange={() => setMode('prepare')} />
        Preparar
      </label>
      <label>
        <input type="radio" name="work-mode" value="publish"
          disabled={disabled}
          checked={mode === 'publish'}
          onChange={() => setMode('publish')} />
        Publicar en Sites
      </label>
    </div>
    <button disabled={disabled} onClick={() => void copy()}>📋 Copiar súper comando Work</button>
    <p role="status">{message || (disabled ? 'Espera a que termine el guardado antes de copiar.' : 'Copiar no autoriza publicar ni cambia estados.')}</p>
    <details><summary>Completar contexto y revisar comando</summary>
      <p>Los datos ausentes aparecen como «NO CONSTA». No se asignan categorías ni rutas automáticamente.</p>
      <div className="form-grid">{commandFields.map(k=><label key={k}>{labels[k]}
        {k === 'destination' ? <input key={article.destination} type="url" defaultValue={article.destination ?? ''} placeholder="NO CONSTA" onBlur={e=>{
          if (safeUrl(e.target.value)) { update({destination:e.target.value}); setMessage(''); setManual(''); }
          else { setMessage('Destino no guardado: escribe una URL HTTP(S) válida.'); e.target.value=article.destination ?? ''; }
        }}/> : <input list={k==='collection'?'riw-collections':undefined} value={article[k] ?? ''} placeholder="NO CONSTA" onChange={e=>{update({[k]:e.target.value});setMessage('');setManual('');}} />}
      </label>)}
      <label>Categoría exacta<input value={article.category} onChange={e=>{if(e.target.value.trim())update({category:e.target.value});}} /></label></div>
      <datalist id="riw-collections">{collections.map(c=><option key={c} value={c}/>)}</datalist>
      <label>Vista previa completa<textarea readOnly rows={12} value={command}/></label>
    </details>
    {manual && <label>Copia manual del comando<textarea autoFocus readOnly rows={12} value={manual} onFocus={e=>e.target.select()}/></label>}
  </section>;
}
