import React, { useEffect, useMemo, useState } from 'react'
import { Sparkles, Github, Download, FileCode2, Folder, Upload, CheckCircle2, AlertCircle, LoaderCircle, Copy, ExternalLink, ChevronRight, Code2, ShieldCheck, Boxes, Menu } from 'lucide-react'

const api = async (url, options={}) => {
  const response = await fetch(url, { credentials: 'include', ...options })
  const data = response.headers.get('content-type')?.includes('application/json') ? await response.json() : null
  if (!response.ok) throw new Error(data?.detail || `Request failed (${response.status})`)
  return data
}
const pretty = path => path.split('/').pop()
export default function App() {
  const [topic, setTopic] = useState('Synthetic Data Generation Using Generative Adversarial Networks for Imbalanced Dataset Augmentation. Build a reproducible ML project that trains a GAN on tabular data, generates minority-class samples, evaluates class balance and downstream classifier performance, and documents limitations and ethical considerations.')
  const [framework, setFramework] = useState('Python · FastAPI · React')
  const [file, setFile] = useState(null)
  const [project, setProject] = useState(null)
  const [files, setFiles] = useState([])
  const [selected, setSelected] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState({kind:'info', text:'Ready to build your project.'})
  const [githubConnected, setGithubConnected] = useState(new URLSearchParams(location.search).get('github') === 'connected')
  const [publishOpen, setPublishOpen] = useState(false)
  const [repoMode, setRepoMode] = useState('new')
  const [repoName, setRepoName] = useState('synthetic-gan-augmentation')
  const [description, setDescription] = useState('Synthetic data generation with GANs for imbalanced dataset augmentation')
  const [visibility, setVisibility] = useState('private')
  const [branch, setBranch] = useState('main')
  const [repos, setRepos] = useState([])
  const [published, setPublished] = useState(null)
  const [mobileMenu, setMobileMenu] = useState(false)
  const selectedFile = files.find(f => f.path === selected)
  const folders = useMemo(() => {
    const result = {}
    files.forEach(f => { const top = f.path.includes('/') ? f.path.split('/')[0] : 'root'; result[top] = (result[top]||0)+1 })
    return result
  }, [files])

  useEffect(() => {
    if (new URLSearchParams(location.search).get('github') === 'connected') {
      setGithubConnected(true); setStatus({kind:'success',text:'GitHub connected successfully.'})
      history.replaceState({}, '', location.pathname)
    }
  }, [])

  const setError = e => setStatus({kind:'error', text:e.message || 'Something went wrong.'})
  const upload = async chosen => {
    if (!chosen) return
    setFile(chosen)
    setBusy(true)
    try {
      const form = new FormData(); form.append('file', chosen)
      const res = await api('/api/projects/extract', {method:'POST', body:form})
      setTopic(res.text || '')
      setStatus({kind:'success',text:`Extracted text from ${chosen.name}. Review it before generating.`})
    } catch (e) {
      // Extraction endpoint is optional in older deployments; surface a clear fallback.
      setStatus({kind:'info',text:`Selected ${chosen.name}. Upload extraction requires the backend extract endpoint; paste the specification below if extraction is unavailable.`})
    } finally { setBusy(false) }
  }
  const generate = async () => {
    setBusy(true); setStatus({kind:'info',text:'Analyzing specification and generating source files…'}); setPublished(null)
    try {
      const result = await api('/api/projects/generate', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({topic,framework})})
      const detail = await api(`/api/projects/${result.project_id}/files`)
      setProject(result); setFiles(detail.files); setSelected(detail.files[0]?.path || '')
      setStatus({kind:'success',text:`Generated ${result.file_count} files (${result.mode === 'ai' ? 'AI-generated' : 'starter template'}).`})
    } catch(e) { setError(e) } finally { setBusy(false) }
  }
  const connectGithub = () => { location.href = '/api/github/login' }
  const openPublish = async () => {
    if (!project) return setStatus({kind:'error',text:'Generate a project before publishing.'})
    setPublishOpen(true)
    if (githubConnected) {
      try { const r = await api('/api/github/repositories'); setRepos(r.repositories) } catch(e) { setError(e) }
    }
  }
  const publish = async () => {
    if (!project) return
    if (!confirm(`Publish ${files.length} files to ${repoName}? This will commit changes to GitHub.`)) return
    setBusy(true); setStatus({kind:'info',text:'Publishing files to GitHub…'})
    try {
      const result = await api('/api/github/publish', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        project_id:project.project_id, repo_name:repoName, description, visibility, branch,
        create_new:repoMode === 'new', confirmed:true
      })})
      setPublished(result); setStatus({kind:'success',text:`Published ${result.files_published} files to GitHub.`}); setPublishOpen(false)
    } catch(e) { setError(e) } finally { setBusy(false) }
  }
  const copyCode = async () => {
    if (!selectedFile) return
    try { await navigator.clipboard.writeText(selectedFile.content); setStatus({kind:'success',text:'File contents copied.'}) }
    catch { setStatus({kind:'error',text:'Clipboard access was blocked by your browser.'}) }
  }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu?'show':''}`}>
      <div className="brand"><div className="brand-icon"><Boxes size={22}/></div><div><b>AI Project Builder</b><small>BUILD · SHIP · REPEAT</small></div></div>
      <div className="side-label">WORKSPACE</div>
      <button className="nav active"><Sparkles size={17}/> Project Studio</button>
      <button className="nav" onClick={()=>document.getElementById('file-workspace')?.scrollIntoView({behavior:'smooth'})}><FileCode2 size={17}/> Generated files</button>
      <button className="nav" onClick={openPublish}><Github size={17}/> GitHub publishing</button>
      <div className="sidebar-bottom"><div className="secure"><ShieldCheck size={18}/><div><b>Security first</b><small>Keys stay on the server</small></div></div><small className="muted">AI WORKSPACE · v1.0</small></div>
    </aside>
    <main className="main">
      <header className="topbar"><button className="mobile-toggle" onClick={()=>setMobileMenu(!mobileMenu)}><Menu/></button><div className="breadcrumb">Workspace <ChevronRight size={14}/> <b>Project Studio</b></div><div className="top-actions"><span className="online-dot"/> <span>Backend-ready workspace</span><button className="avatar">AI</button></div></header>
      <div className="content">
        <section className="hero"><div><div className="eyebrow"><Sparkles size={14}/> YOUR AI-POWERED WORKSPACE</div><h1>Turn ideas into <span>working software.</span></h1><p>Describe your project. Generate a codebase, inspect every file, download it, or publish straight to GitHub.</p></div><div className="hero-orb"><div className="orb-inner"><Code2 size={34}/><span>AI</span></div></div></section>
        <div className="stats">
          <div className="stat"><span className="stat-icon purple"><Sparkles size={17}/></span><div><small>PROJECT STATUS</small><b>{project?'Generated':'Ready to build'}</b></div></div>
          <div className="stat"><span className="stat-icon blue"><FileCode2 size={17}/></span><div><small>SOURCE FILES</small><b>{files.length} files</b></div></div>
          <div className="stat"><span className="stat-icon green"><Github size={17}/></span><div><small>GITHUB</small><b>{githubConnected?'Connected':'Not connected'}</b></div></div>
        </div>
        {status.text && <div className={`notice ${status.kind}`}><span>{status.kind==='error'?<AlertCircle size={17}/>:status.kind==='success'?<CheckCircle2 size={17}/>:<Sparkles size={17}/>}</span><div>{status.text}</div>{busy&&<LoaderCircle className="spin" size={17}/>}</div>}
        <section className="builder-card">
          <div className="section-heading"><div className="step">01</div><div><h2>Define your project</h2><p>Start with a topic, brief, or product specification.</p></div><span className="required-pill">REQUIRED</span></div>
          <label className="field-label" htmlFor="topic">Project topic & requirements</label>
          <textarea id="topic" value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Describe what you want to build, its features, data model, APIs, and preferred behavior…" rows={6}/>
          <div className="input-footer"><span>{topic.length.toLocaleString()} characters</span><label className="upload-btn"><Upload size={15}/> {file?file.name:'Upload specification'}<input type="file" accept=".pdf,.docx,.txt,.md,.png,.jpg,.jpeg,.webp" onChange={e=>upload(e.target.files?.[0])}/></label></div>
          <div className="field-row"><div className="field-grow"><label className="field-label" htmlFor="framework">Preferred language / framework</label><select id="framework" value={framework} onChange={e=>setFramework(e.target.value)}><option>Python · FastAPI · React</option><option>Python · Flask</option><option>Python · Django</option><option>React · Node.js · Express</option><option>Next.js · TypeScript</option><option>Java · Spring Boot</option><option>JavaScript · Node.js</option><option>Python · PyTorch · scikit-learn</option><option>Custom / infer from specification</option></select></div><div className="field-grow"><label className="field-label">Generation mode</label><div className="mode-pill"><span className="pulse"/> Full project codebase <span className="mode-tag">AI</span></div></div></div>
          <div className="generate-row"><div className="helper"><ShieldCheck size={15}/> API keys are kept on the backend.</div><button className="primary-btn" disabled={busy||topic.trim().length<5} onClick={generate}>{busy?<LoaderCircle size={17} className="spin"/>:<Sparkles size={17}/>} {busy?'Generating…':'Generate project'} <span>→</span></button></div>
        </section>

        <section className="workspace" id="file-workspace">
          <div className="section-heading workspace-head"><div className="step">02</div><div><h2>Project workspace</h2><p>Explore the generated structure and preview source code.</p></div>{project&&<span className="file-count">{files.length} FILES</span>}</div>
          <div className="editor">
            <div className="file-panel"><div className="panel-title"><Folder size={15}/> EXPLORER <span>{files.length}</span></div>
              {!files.length?<div className="empty-files"><div className="empty-icon"><FileCode2 size={25}/></div><b>Your files will appear here</b><p>Generate a project to explore its folders and source files.</p></div>:<div className="file-list">
                {Object.entries(folders).map(([folder,count])=><div className="folder-group" key={folder}><div className="folder-name"><Folder size={14}/>{folder==='root'?'Root':folder}<small>{count}</small></div>{files.filter(f=>(f.path.includes('/')?f.path.split('/')[0]:'root')===folder).map(f=><button key={f.path} className={`file-row ${selected===f.path?'selected':''}`} onClick={()=>setSelected(f.path)}><FileCode2 size={14}/><span>{pretty(f.path)}</span></button>)}</div>)}
              </div>}
            </div>
            <div className="code-panel"><div className="code-toolbar"><div className="file-tab"><FileCode2 size={14}/>{selected||'No file selected'}</div><div className="code-actions">{selectedFile&&<button className="icon-btn" title="Copy file" onClick={copyCode}><Copy size={14}/></button>}<span className="language-dot"/> <small>{selectedFile?`${selectedFile.size} bytes`:'Waiting for generation'}</small></div></div>
              {selectedFile?<pre className="code-preview"><code>{selectedFile.content}</code></pre>:<div className="empty-code"><Code2 size={34}/><b>Ready when you are</b><p>Generate your project to preview source code here.</p></div>}
            </div>
          </div>
          <div className="action-row"><div><b>{project?'Your codebase is ready':'No project generated yet'}</b><p>{project?'Download a ZIP or publish your reviewed files.':'Your generated files will be available for download and publishing.'}</p></div><div className="action-buttons"><button className="secondary-btn" disabled={!project||busy} onClick={()=>{location.href=`/api/projects/${project.project_id}/download`}}><Download size={16}/> Download ZIP</button><button className="github-btn" disabled={!project||busy} onClick={openPublish}><Github size={16}/> Publish to GitHub <ExternalLink size={13}/></button></div></div>
        </section>

        {publishOpen&&<section className="publish-card"><div className="section-heading"><div className="step">03</div><div><h2>Publish to GitHub</h2><p>Review destination settings before committing your generated files.</p></div><button className="close-btn" onClick={()=>setPublishOpen(false)}>×</button></div>
          {!githubConnected?<div className="connect-box"><div className="connect-icon"><Github size={26}/></div><div><b>Connect your GitHub account</b><p>Authorize access using GitHub OAuth. Your password is never requested by this app.</p></div><button className="primary-btn" onClick={connectGithub}><Github size={16}/> Connect GitHub</button></div>:
          <><div className="connected-banner"><CheckCircle2 size={17}/> GitHub account authorized <span>OAuth session</span></div><div className="radio-cards"><button className={repoMode==='new'?'radio-card chosen':'radio-card'} onClick={()=>setRepoMode('new')}><span className="radio-circle"/><div><b>Create new repository</b><small>Create a fresh repository under your account.</small></div></button><button className={repoMode==='existing'?'radio-card chosen':'radio-card'} onClick={()=>setRepoMode('existing')}><span className="radio-circle"/><div><b>Use existing repository</b><small>Add files to a repository you can access.</small></div></button></div>
            <div className="form-grid"><div><label className="field-label">{repoMode==='new'?'Repository name':'Select repository'}</label>{repoMode==='new'?<input value={repoName} onChange={e=>setRepoName(e.target.value)} placeholder="my-project"/>:<select value={repoName} onChange={e=>{setRepoName(e.target.value);const r=repos.find(x=>x.full_name===e.target.value);if(r)setBranch(r.default_branch)}}><option value="">Choose a repository…</option>{repos.map(r=><option key={r.full_name} value={r.full_name}>{r.full_name}{r.private?' · private':' · public'}</option>)}</select>}</div><div><label className="field-label">Target branch</label><input value={branch} onChange={e=>setBranch(e.target.value)} placeholder="main"/></div><div className="full-field"><label className="field-label">Description</label><input value={description} onChange={e=>setDescription(e.target.value)} maxLength={350}/></div>{repoMode==='new'&&<div className="full-field"><label className="field-label">Repository visibility</label><div className="visibility-row"><button className={visibility==='private'?'visibility selected':'visibility'} onClick={()=>setVisibility('private')}><ShieldCheck size={15}/> Private</button><button className={visibility==='public'?'visibility selected':'visibility'} onClick={()=>setVisibility('public')}><ExternalLink size={15}/> Public</button></div></div>}</div>
            <div className="review-note"><ShieldCheck size={17}/><div><b>Review before publishing</b><p>{files.length} files will be committed to <code>{repoName||'your repository'}</code> on branch <code>{branch}</code>. Existing files with matching paths may be replaced by the new commit.</p></div></div>
            <button className="primary-btn publish-action" disabled={busy||!repoName.trim()||!branch.trim()} onClick={publish}>{busy?<LoaderCircle className="spin" size={17}/>:<Github size={17}/>} Confirm & publish files</button>
          </>}
        </section>}
        {published&&<div className="published-card"><CheckCircle2 size={22}/><div><b>Project published successfully</b><p>{published.files_published} files committed to branch <code>{published.branch}</code>.</p><a href={published.repository_url} target="_blank" rel="noreferrer">{published.repository_url} <ExternalLink size={13}/></a></div></div>}
        <footer><div className="brand-mini"><Boxes size={17}/> AI Project Builder</div><span>Built for makers, students & teams.</span><span className="footer-security"><ShieldCheck size={14}/> Secure by design</span></footer>
      </div>
    </main>
  </div>
}
