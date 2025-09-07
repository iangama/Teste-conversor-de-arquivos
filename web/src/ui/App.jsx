import React, { useState, useRef, useEffect } from 'react'
const API_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:4000');

export default function App(){
  const [file, setFile] = useState(null);
  const [target, setTarget] = useState('pdf');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [jobs, setJobs] = useState([]);
  const bar = useRef(null);

  useEffect(()=>{
    const t = setInterval(async ()=>{
      setJobs(prev => {
        prev.forEach(async (j)=>{
          if(j.state==='completed' || j.state==='failed') return;
          const r = await fetch(`${API_BASE}/status/${j.id}`).then(r=>r.json());
          j.state = r.state; j.outputUrl = r.outputUrl; j.error = r.error;
        });
        return [...prev];
      });
    }, 1000);
    return ()=> clearInterval(t);
  },[]);

  async function doUpload(){
    if(!file) return setMsg('Escolha um arquivo');
    setBusy(true); setMsg('Enviando…'); if(bar.current) bar.current.style.width = '30%';

    const fd = new FormData();
    fd.append('file', file);
    fd.append('targetFormat', target);
    try{
      const r = await fetch(`${API_BASE}/upload`, { method:'POST', body:fd });
      const j = await r.json();
      if(!r.ok) throw new Error(j?.error || 'Falha no upload');
      if(bar.current) bar.current.style.width = '70%';
      setJobs([{ id:j.jobId, state:'waiting', outputUrl:null, name:file.name, target }, ...jobs]);
      setMsg('Job criado. Aguardando processamento…');
    }catch(e){
      setMsg(`Erro: ${e.message}`);
    }finally{
      setBusy(false);
      if(bar.current) bar.current.style.width = '100%';
      setTimeout(()=>{ if(bar.current) bar.current.style.width='0%'; }, 600);
    }
  }

  return (
    <div className="wrap">
      <div className="card">
        <h1>FileX Converter</h1>
        <p className="muted">Envie um arquivo e escolha o formato de destino. Suporta: DOCX→PDF, XLSX→CSV, PNG/JPG→WEBP.</p>

        <div className="row">
          <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} />
          <div className="ctl">
            <select value={target} onChange={e=>setTarget(e.target.value)}>
              <option value="pdf">→ PDF (DOCX)</option>
              <option value="csv">→ CSV (XLSX)</option>
              <option value="webp">→ WEBP (PNG/JPG)</option>
            </select>
            <button disabled={busy} onClick={doUpload}>Converter</button>
          </div>
        </div>

        <div className="status">
          <div className="bar"><i ref={bar}></i></div>
          <span className={`pill ${msg.startsWith('Erro')?'err':msg.includes('Aguardando')||msg.includes('Job')?'ok':''}`}>{msg || 'Pronto'}</span>
        </div>

        <div className="jobs">
          {jobs.map(j=>(
            <div key={j.id} className="job">
              <div>
                <strong>{j.name}</strong><br/>
                <small>ID: {j.id} • Estado: {j.state}</small>
              </div>
              {j.state==='completed' && j.outputUrl
                ? <a className="btn" href={`${API_BASE}${j.outputUrl}`} target="_blank">Baixar</a>
                : j.state==='failed'
                  ? <span className="pill err">Falhou</span>
                  : <span className="pill">Processando…</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
