import { useEffect, useMemo, useState } from 'react'
import {
  AppWindow, ArrowLeft, Bell, BriefcaseBusiness, Check, CheckCircle2, ChevronDown, ChevronRight,
  CircleUserRound, ClipboardCheck, Clock3, ExternalLink, FileText, Headphones, History, Info, Keyboard,
  Mail, MapPin, Megaphone, Menu, MessageSquareText, MonitorSmartphone, MoreHorizontal, Phone, PhoneCall,
  PhoneIncoming, PhoneOff, Plus, RefreshCw, Search, Send, Sparkles, UserRound, UserRoundCheck, UsersRound,
  Video, X,
} from 'lucide-react'
import { people, procedures, seededCases, serviceNames } from './data'
import type { AttentionCase, Channel, Person, Procedure, Result, Service } from './types'

type View = 'console' | 'close' | 'laguntzaile'
type ModalName = null | 'procedure' | 'service' | 'derive' | 'task' | 'integration' | 'success'

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`

function caseStatus(item: AttentionCase): 'Completado' | 'Abierto' {
  const pendingService = item.services.some((service) => service.result !== 'Completado')
  const pendingTask = item.tasks.some((task) => !task.done)
  return pendingService || pendingTask ? 'Abierto' : 'Completado'
}

function StatusBadge({ status }: { status: Result | 'Derivado' | 'En curso' }) {
  const kind = status === 'Completado' ? 'success' : status === 'Derivado' ? 'info' : 'warning'
  return <span className={`status-badge ${kind}`}><span className="status-dot" />{status}</span>
}

function Button({ children, variant = 'secondary', icon, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger', icon?: React.ReactNode }) {
  return <button className={`btn btn-${variant} ${className}`} {...props}>{icon}{children}</button>
}

function Modal({ title, subtitle, onClose, children, wide = false }: { title: string, subtitle?: string, onClose: () => void, children: React.ReactNode, wide?: boolean }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
      <header className="modal-header"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button className="icon-button" onClick={onClose} aria-label="Cerrar"><X size={19} /></button></header>
      <div className="modal-body">{children}</div>
    </section>
  </div>
}

function Toast({ message, onClose }: { message: string, onClose: () => void }) {
  return <div className="toast" role="status"><span className="toast-check"><Check size={15} /></span><span>{message}</span><button onClick={onClose} aria-label="Cerrar aviso"><X size={16} /></button></div>
}

function Brand() {
  return <div className="brand" aria-label="Bizkaia Atención Ciudadana"><div className="brand-mark">B</div><div><strong>Bizkaia</strong><span>Atención Ciudadana</span></div></div>
}

function AppHeader({ channel, onScenario }: { channel: Channel, onScenario: (scenario: string) => void }) {
  const [open, setOpen] = useState(false)
  return <header className="app-header">
    <Brand />
    <div className="header-context"><span className="context-pill"><Sparkles size={14} /> Entorno de demostración</span><span className="header-divider" /><span>Capa UX sobre Microsoft Dynamics 365</span></div>
    <div className="user-menu-wrap">
      <button className="user-button" onClick={() => setOpen(!open)} aria-expanded={open}><span className="avatar">AG</span><span><strong>Agente</strong><small>{channel}</small></span><ChevronDown size={16} /></button>
      {open && <div className="scenario-menu">
        <div className="scenario-title"><MonitorSmartphone size={16} /><span><strong>Escenario de demostración</strong><small>Salta a un punto del recorrido</small></span></div>
        {[
          ['Presencial — inicio', 'presencial-start'], ['Presencial — atención en curso', 'presencial-active'],
          ['Telefónico — inicio', 'phone-start'], ['Atención con varios casos', 'multi'], ['Cierre administrativo', 'close'],
        ].map(([label, id]) => <button key={id} onClick={() => { onScenario(id); setOpen(false) }}>{label}<ChevronRight size={15} /></button>)}
        <div className="scenario-separator" />
        <button className="reset-link" onClick={() => { onScenario('reset'); setOpen(false) }}><RefreshCw size={15} />Restablecer demo</button>
      </div>}
    </div>
  </header>
}

function PersonSearch({ person, disabled, representative, onRepresentative, onSelect, onToast }: {
  person?: Person, disabled: boolean, representative: boolean, onRepresentative: (value: boolean) => void,
  onSelect: (person: Person) => void, onToast: (message: string) => void,
}) {
  const [query, setQuery] = useState('')
  useEffect(() => { if (!person) setQuery('') }, [person])
  const searchPerson = () => {
    if (!query.trim()) { onToast('Introduce un identificador para realizar la búsqueda'); return }
    const found = people.find((item) => item.id.toLowerCase() === query.trim().toLowerCase()) ?? people[0]
    onSelect(found)
    setQuery(found.id)
    onToast(`${found.name} ${found.surnames} seleccionada`)
  }
  return <div className={`person-search ${disabled ? 'is-disabled' : ''}`}>
    <div className="field-label-row"><label htmlFor="person-id">Identificación de la persona atendida</label>{person && <span className="verified"><UserRoundCheck size={14} /> Verificada</span>}</div>
    <div className="search-row"><div className="input-with-icon"><Search size={16} /><input id="person-id" disabled={disabled} value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && searchPerson()} placeholder="Ej. 16000001A" /></div><Button disabled={disabled} onClick={searchPerson}>Buscar</Button></div>
    {!disabled && !person && <button className="demo-hint" onClick={() => setQuery(people[0].id)}>Usar identificador demo: <strong>16000001A</strong></button>}
    <label className="checkbox-row"><input disabled={disabled} type="checkbox" checked={representative} onChange={(event) => onRepresentative(event.target.checked)} /><span>Marcar como representante en la atención</span></label>
    <div className="person-summary">
      <div><small>Nombre</small><strong>{person ? person.name : '—'}</strong></div>
      <div><small>Apellidos</small><strong>{person ? person.surnames : '—'}</strong></div>
      <div><small>Idioma</small><strong>{person ? person.language : '—'}</strong></div>
      <div><small>Código postal</small><strong>{person ? person.postalCode : '—'}</strong></div>
      <div className="span-two"><small>Tratamiento de género</small><strong>{person ? person.treatment : '—'}</strong></div>
    </div>
  </div>
}

function AttentionPanel({ started, startTime, channel, person, representative, cases, onRepresentative, onPerson, onClose, onToast }: {
  started: boolean, startTime?: string, channel: Channel, person?: Person, representative: boolean, cases: AttentionCase[],
  onRepresentative: (value: boolean) => void, onPerson: (person: Person) => void, onClose: () => void, onToast: (message: string) => void,
}) {
  return <section className="card attention-card">
    <div className="card-heading"><div><span className="eyebrow">INTERACCIÓN EN CURSO</span><h2>Atención</h2></div><Button variant="secondary" icon={<ClipboardCheck size={16} />} disabled={!person || cases.length === 0} onClick={onClose}>Cerrar atención</Button></div>
    <div className="attention-meta">
      <span><Clock3 size={15} /><small>Inicio</small><strong>{started ? startTime : 'Pendiente'}</strong></span>
      <span><MonitorSmartphone size={15} /><small>Canal</small><strong>{channel}</strong></span>
      <span><BriefcaseBusiness size={15} /><small>Oficina</small><strong>{channel === 'Presencial' ? 'Bilbao · Gran Vía 25' : 'Centro de atención'}</strong></span>
    </div>
    <div className="section-divider"><span>Persona atendida</span></div>
    <PersonSearch person={person} disabled={!started} representative={representative} onRepresentative={onRepresentative} onSelect={onPerson} onToast={onToast} />
    {!started && <div className="empty-inline"><Info size={16} /><span>Inicia la atención desde el panel de {channel === 'Presencial' ? 'turnos' : 'telefonía'} para identificar a la persona.</span></div>}
  </section>
}

function CasesList({ cases, activeId, enabled, onSelect, onAdd }: { cases: AttentionCase[], activeId?: string, enabled: boolean, onSelect: (id: string) => void, onAdd: () => void }) {
  return <section className="card cases-card">
    <div className="card-heading"><div><span className="eyebrow">MISMA INTERACCIÓN</span><h2>Casos en esta atención <span className="count-badge">{cases.length}</span></h2></div></div>
    {cases.length === 0 ? <div className="empty-state compact"><span className="empty-icon"><FileText size={21} /></span><strong>Todavía no hay casos</strong><p>Selecciona un trámite para registrar la primera demanda.</p></div> : <div className="case-list">
      {cases.map((item, index) => {
        const last = item.services[item.services.length - 1]
        return <button key={item.id} className={`case-item ${activeId === item.id ? 'active' : ''}`} onClick={() => onSelect(item.id)}>
          <span className="case-number">{index + 1}</span><span className="case-main"><strong>{item.procedure.name}</strong><small>{item.procedure.type} · {item.services.length} servicio{item.services.length !== 1 ? 's' : ''}</small><span>{last ? `${last.name} · ${last.result}` : 'Sin servicios'}</span></span><StatusBadge status={caseStatus(item)} /><ChevronRight size={17} />
        </button>
      })}
    </div>}
    <Button className="full-width" variant={cases.length ? 'secondary' : 'primary'} icon={<Plus size={17} />} disabled={!enabled} onClick={onAdd}>{cases.length ? 'Añadir otro caso' : 'Seleccionar trámite'}</Button>
  </section>
}

function EmptyActiveCase({ enabled, onAdd }: { enabled: boolean, onAdd: () => void }) {
  return <section className="card active-card empty-active"><div className="empty-illustration"><div className="illustration-ring"><FileText size={29} /></div><span className="mini-plus"><Plus size={13} /></span></div><h2>Empieza por la demanda ciudadana</h2><p>Localiza el trámite adecuado y crea un caso sin salir de la consola.</p><Button variant="primary" icon={<Search size={17} />} disabled={!enabled} onClick={onAdd}>Seleccionar trámite</Button>{!enabled && <small>Identifica primero a la persona atendida.</small>}</section>
}

function ServiceTable({ services }: { services: Service[] }) {
  return <div className="table-wrap"><table className="data-table"><thead><tr><th>Servicio</th><th>Resultado</th><th>Observaciones</th></tr></thead><tbody>{services.length ? services.map((service) => <tr key={service.id}><td><strong>{service.name}</strong></td><td><StatusBadge status={service.result} /></td><td>{service.notes || '—'}</td></tr>) : <tr><td colSpan={3} className="table-empty">No hay servicios registrados.</td></tr>}</tbody></table></div>
}

function InterestedPerson({ activeCase, attended, onUpdate, onToast }: { activeCase: AttentionCase, attended?: Person, onUpdate: (person?: Person) => void, onToast: (message: string) => void }) {
  const [tab, setTab] = useState<'data' | 'history'>('data')
  const [query, setQuery] = useState('')
  const same = Boolean(attended && activeCase.interestedPerson?.id === attended.id)
  const search = () => {
    const found = people.find((item) => item.id.toLowerCase() === query.trim().toLowerCase()) ?? people[1]
    onUpdate(found); setQuery(found.id); onToast('Persona interesada actualizada')
  }
  return <section className="card interested-card">
    <div className="card-heading"><div><span className="eyebrow">VINCULACIÓN</span><h2>Persona interesada</h2></div></div>
    <div className="tabs"><button className={tab === 'data' ? 'active' : ''} onClick={() => setTab('data')}>Datos</button><button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}><History size={14} /> Histórico de relación</button></div>
    {tab === 'data' ? <div className="interested-content">
      <label className="checkbox-row"><input type="checkbox" checked={same} onChange={(event) => onUpdate(event.target.checked ? attended : undefined)} /><span>Igual que persona atendida</span></label>
      {!same && <div className="search-row narrow"><div className="input-with-icon"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Identificador de otra persona" /></div><Button onClick={search}>Buscar</Button></div>}
      <div className="person-line"><span className="person-avatar"><UserRound size={18} /></span><div><small>Persona interesada</small><strong>{activeCase.interestedPerson ? `${activeCase.interestedPerson.name} ${activeCase.interestedPerson.surnames}` : 'Sin identificar'}</strong></div>{activeCase.interestedPerson && <code>{activeCase.interestedPerson.id}</code>}</div>
    </div> : <div className="history-list"><span className="timeline-dot" /><div><strong>Sin relaciones previas relevantes</strong><p>La maqueta no consulta sistemas externos. En producción se mostraría aquí la trazabilidad disponible en Dynamics 365.</p></div></div>}
  </section>
}

function SupportResources({ onIntegration }: { onIntegration: (name: string) => void }) {
  return <aside className="support-box">
    <div className="support-section"><h3>Aplicaciones</h3><button onClick={() => onIntegration('Registro')}><AppWindow size={16} /><span>Registro</span><ExternalLink size={14} /></button><button onClick={() => onIntegration('Visor Carpeta Social')}><UsersRound size={16} /><span>Visor Carpeta Social</span><ExternalLink size={14} /></button></div>
    <div className="support-section reminder"><h3><Bell size={15} /> No olvides…</h3><ul><li>Justificante</li><li>Copias de documentos</li><li>Guía 2026</li></ul></div>
  </aside>
}

function ActiveCase({ item, onUpdate, onAddService, onDerive, onLaguntzaile, onIntegration }: {
  item: AttentionCase, onUpdate: (item: AttentionCase) => void, onAddService: () => void, onDerive: () => void, onLaguntzaile: () => void, onIntegration: (name: string) => void,
}) {
  const [tab, setTab] = useState<'now' | 'history'>('now')
  return <section className="card active-card">
    <div className="card-heading active-heading"><div><span className="eyebrow">CASO ACTIVO · {item.id}</span><div className="title-status"><h2>{item.procedure.name}</h2><StatusBadge status={item.derived ? 'Derivado' : caseStatus(item)} /></div><p>{item.procedure.department} · {item.procedure.topic}</p></div><div className="heading-actions">{item.derived && <Button variant="ghost" icon={<ExternalLink size={15} />} onClick={onLaguntzaile}>Ver en Laguntzaile</Button>}<Button variant="secondary" icon={<Send size={16} />} onClick={onDerive}>{item.derived ? 'Revisar derivación' : 'Derivar'}</Button></div></div>
    <div className="tabs"><button className={tab === 'now' ? 'active' : ''} onClick={() => setTab('now')}>Ahora</button><button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}><History size={14} /> Histórico del caso</button></div>
    {tab === 'history' ? <div className="case-history"><div className="history-event"><span><Check size={13} /></span><div><strong>Caso creado desde la consola</strong><small>Hoy · Atención actual</small></div></div>{item.derived && <div className="history-event"><span><Send size={13} /></span><div><strong>Demanda derivada a {item.derived.manager}</strong><small>Hoy · {item.derived.type}</small></div></div>}</div> : <>
      <div className="case-detail-grid"><div className="case-main-column">
        <div className="compact-fields"><div><small>Gestión</small><strong>{item.procedure.type}</strong></div><div><small>Procedimiento</small><strong>{item.procedure.procedure}</strong></div><div><small>Colectivo</small><strong>{item.procedure.collective}</strong></div></div>
        {item.derived && <div className="derived-banner"><Send size={17} /><div><strong>Demanda derivada</strong><span>{item.derived.type} · {item.derived.manager}{item.derived.delegate ? ` · ${item.derived.delegate}` : ''}</span></div><StatusBadge status="Derivado" /></div>}
        <div className="subheading-row"><h3>Servicios realizados en este caso <span>{item.services.length}</span></h3><Button variant="ghost" icon={<Plus size={16} />} onClick={onAddService}>Añadir servicio</Button></div>
        <ServiceTable services={item.services} />
        <label className="notes-field"><span>Observaciones del caso</span><textarea value={item.notes} onChange={(event) => onUpdate({ ...item, notes: event.target.value })} placeholder="Añade contexto útil para este caso…" /></label>
      </div><SupportResources onIntegration={onIntegration} /></div>
    </>}
  </section>
}

function TurnPanel({ started, onStart, onRepeat }: { started: boolean, onStart: () => void, onRepeat: () => void }) {
  return <section className="card side-card turn-panel">
    <div className="side-title"><span className="side-icon"><Megaphone size={20} /></span><div><h2>Llamada a mesa</h2><p>Gestión del turno presencial</p></div></div>
    <div className={`turn-display ${started ? 'called' : ''}`}><small>{started ? 'Turno en atención' : 'Siguiente turno'}</small><strong>115</strong><span>Mesa asignada <b>4</b></span></div>
    <Button className="full-width tall" variant="primary" icon={<Megaphone size={19} />} onClick={onStart}>{started ? 'TURNO 115 EN MESA' : 'LLAMAR A MESA'}</Button>
    <Button className="full-width" variant="secondary" icon={<RefreshCw size={16} />} onClick={onRepeat}>REPETIR LLAMADA</Button>
    <div className="info-note"><Info size={17} /><p>Al llamar, el turno se notifica en el tótem y en la pantalla de la sala de espera.</p></div>
  </section>
}

function TelephonyPanel({ started, onStart, onToast }: { started: boolean, onStart: () => void, onToast: (message: string) => void }) {
  const [number, setNumber] = useState('')
  return <section className="card side-card telephony-panel">
    <div className="mitel-title"><div><span className={`presence-dot ${started ? 'busy' : ''}`} /><div><h2>Conector telefónico</h2><p>Simulación · Sin conexión real</p></div></div><MoreHorizontal size={19} /></div>
    <div className="agent-identity"><span className="agent-avatar">AG</span><div><strong>Agente Ciudadanía</strong><small>Extensión 2000</small></div><span className="ready">{started ? 'En llamada' : 'Ready'}</span></div>
    {!started ? <div className="incoming-call"><span className="pulse"><PhoneIncoming size={22} /></span><div><small>Llamada entrante</small><strong>Ciudadanía · número oculto</strong></div><Button variant="primary" icon={<Phone size={17} />} onClick={onStart}>Aceptar</Button></div> : <div className="call-live"><div><small>Llamada en curso</small><strong>02:14</strong></div><span className="waveform">▂▄▆▃▅▇▄▂▆</span></div>}
    <div className="phone-controls">
      <button title="Silenciar" onClick={() => onToast('Micrófono silenciado (simulación)')}><Headphones size={19} /><span>Silenciar</span></button>
      <button title="Teclado" onClick={() => onToast('Teclado de marcación listo')}><Keyboard size={19} /><span>Teclado</span></button>
      <button title="Videollamada" onClick={() => onToast('Videollamada no disponible en la demo')}><Video size={19} /><span>Vídeo</span></button>
      <button className="hangup" title="Finalizar llamada" onClick={() => onToast('La llamada se cerrará al confirmar la atención')}><PhoneOff size={19} /><span>Colgar</span></button>
    </div>
    <label className="dial-field"><span>Marcación manual</span><div><input value={number} onChange={(event) => setNumber(event.target.value)} placeholder="Nombre o número" /><button onClick={() => onToast(number ? `Marcación a ${number} simulada` : 'Introduce un número')}><PhoneCall size={18} /></button></div></label>
    <div className="connector-note"><Info size={15} /><span>Panel visual inspirado en Mitel CRM Connector. No realiza llamadas.</span></div>
  </section>
}

function ProcedureModal({ onClose, onCreate, onQuick }: { onClose: () => void, onCreate: (procedure: Procedure) => void, onQuick: (label: string) => void }) {
  const [query, setQuery] = useState('')
  const [department, setDepartment] = useState('Todos')
  const [type, setType] = useState('Todos')
  const [selected, setSelected] = useState<Procedure>()
  const results = useMemo(() => procedures.filter((item) => {
    const haystack = `${item.name} ${item.type} ${item.procedure} ${item.collective} ${item.department} ${item.topic}`.toLowerCase()
    return haystack.includes(query.toLowerCase()) && (department === 'Todos' || item.department === department) && (type === 'Todos' || item.type === type)
  }), [query, department, type])
  const departments = ['Todos', ...new Set(procedures.map((item) => item.department))]
  const types = ['Todos', ...new Set(procedures.map((item) => item.type))]
  return <Modal title="Seleccionar trámite" subtitle="Localiza el trámite que corresponde a la demanda de la persona." onClose={onClose} wide>
    <div className="procedure-toolbar"><div className="procedure-search"><Search size={20} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busca por palabras clave, por ejemplo “jubilación”" /><kbd>⌘ K</kbd></div><Button variant="primary" icon={<Plus size={18} />} disabled={!selected} onClick={() => selected && onCreate(selected)}>Crear caso de atención</Button></div>
    <div className="filters"><span>Filtrar por</span><label>Departamento<select value={department} onChange={(event) => setDepartment(event.target.value)}>{departments.map((item) => <option key={item}>{item}</option>)}</select></label><label>Tipo de gestión<select value={type} onChange={(event) => setType(event.target.value)}>{types.map((item) => <option key={item}>{item}</option>)}</select></label>{(department !== 'Todos' || type !== 'Todos' || query) && <button onClick={() => { setQuery(''); setDepartment('Todos'); setType('Todos') }}><X size={14} /> Limpiar filtros</button>}</div>
    <div className="results-summary"><strong>{results.length} trámites encontrados</strong><span>Selecciona una fila para continuar</span></div>
    <div className="procedure-table-wrap"><table className="procedure-table"><thead><tr><th /><th>Nombre del trámite</th><th>Tipo / gestión</th><th>Procedimiento</th><th>Colectivo</th><th>Departamento</th><th>Tema</th></tr></thead><tbody>{results.map((item) => <tr key={item.id} className={selected?.id === item.id ? 'selected' : ''} onClick={() => setSelected(item)}><td><input type="radio" checked={selected?.id === item.id} onChange={() => setSelected(item)} aria-label={`Seleccionar ${item.name}`} /></td><td><strong>{item.name}</strong><small>{item.id}</small></td><td>{item.type}</td><td>{item.procedure}</td><td>{item.collective}</td><td>{item.department}</td><td>{item.topic}</td></tr>)}</tbody></table>{results.length === 0 && <div className="no-results"><Search size={24} /><strong>No hay resultados</strong><span>Prueba con otras palabras o elimina algún filtro.</span></div>}</div>
    <div className="quick-actions"><div><span className="eyebrow">GESTIONES FRECUENTES</span><h3>Acciones rápidas</h3></div><button onClick={() => onQuick('Entrada registro')}><FileText size={19} /><span><strong>Entrada registro</strong><small>Registrar documentación recibida</small></span><ChevronRight size={17} /></button><button onClick={() => onQuick('Entrega notificaciones')}><Bell size={19} /><span><strong>Entrega notificaciones</strong><small>Gestionar una entrega presencial</small></span><ChevronRight size={17} /></button></div>
  </Modal>
}

function AddServiceModal({ onClose, onSave }: { onClose: () => void, onSave: (service: Service) => void }) {
  const [name, setName] = useState(serviceNames[2])
  const [result, setResult] = useState<Result>('Completado')
  const [notes, setNotes] = useState('')
  return <Modal title="Añadir nuevo servicio" subtitle="Registra la actividad realizada dentro del caso." onClose={onClose}><div className="form-grid"><label>Servicio *<select value={name} onChange={(event) => setName(event.target.value)}>{serviceNames.map((item) => <option key={item}>{item}</option>)}</select></label><label>Resultado *<select value={result} onChange={(event) => setResult(event.target.value as Result)}><option>Completado</option><option>Abierto</option><option>Pendiente</option></select></label><label className="full">Observaciones<textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Resume el resultado del servicio…" /></label></div><div className="modal-actions"><Button onClick={onClose}>Cancelar</Button><Button variant="primary" icon={<Plus size={16} />} onClick={() => onSave({ id: uid('S'), name, result, notes })}>Añadir servicio</Button></div></Modal>
}

function DerivationModal({ item, onClose, onSave }: { item: AttentionCase, onClose: () => void, onSave: (derived: NonNullable<AttentionCase['derived']>) => void }) {
  const [type, setType] = useState(item.derived?.type ?? 'Gestor departamental')
  const [manager, setManager] = useState(item.derived?.manager ?? item.procedure.department)
  const [delegate, setDelegate] = useState(item.derived?.delegate ?? '')
  const [notes, setNotes] = useState(item.derived?.notes ?? '')
  return <Modal title="Derivar demanda" subtitle="Envía el caso a un equipo especializado conservando su contexto." onClose={onClose}>
    <div className="demand-summary"><span><FileText size={18} /></span><div><small>Información de la demanda</small><strong>{item.procedure.name}</strong><p>{item.notes || 'Sin observaciones registradas.'}</p></div></div>
    <div className="form-grid"><label>Tipo de derivación *<select value={type} onChange={(event) => setType(event.target.value)}><option>Gestor departamental</option><option>Consulta especializada</option><option>Segundo nivel</option></select></label><label>Gestor departamental *<select value={manager} onChange={(event) => setManager(event.target.value)}><option>{item.procedure.department}</option><option>Unidad de Prestaciones Sociales</option><option>Oficina Técnica Ciudadana</option></select></label><label className="full">Gestor delegado<select value={delegate} onChange={(event) => setDelegate(event.target.value)}><option value="">Sin asignar</option><option>Equipo Prestaciones A</option><option>Equipo Información Especializada</option><option>Coordinación de oficina</option></select></label><label className="full">Observaciones<textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Añade el contexto necesario para el equipo receptor…" /></label></div>
    <div className="modal-actions"><Button onClick={onClose}>Cancelar</Button><Button variant="primary" icon={<Send size={16} />} onClick={() => onSave({ type, manager, delegate, notes })}>Derivar</Button></div>
  </Modal>
}

function AddTaskModal({ caseName, onClose, onSave }: { caseName: string, onClose: () => void, onSave: (text: string) => void }) {
  const [text, setText] = useState('')
  return <Modal title="Añadir tarea" subtitle={caseName} onClose={onClose}><label className="single-field">Tarea pendiente<textarea autoFocus value={text} onChange={(event) => setText(event.target.value)} placeholder="Describe la acción que debe realizarse…" /></label><div className="modal-actions"><Button onClick={onClose}>Cancelar</Button><Button variant="primary" icon={<Plus size={16} />} disabled={!text.trim()} onClick={() => onSave(text)}>Añadir tarea</Button></div></Modal>
}

function CloseAttention({ person, cases, channel, startTime, onBack, onConfirm, onUpdateCase, onAddTask }: {
  person: Person, cases: AttentionCase[], channel: Channel, startTime?: string, onBack: () => void, onConfirm: () => void,
  onUpdateCase: (item: AttentionCase) => void, onAddTask: (caseId: string) => void,
}) {
  return <main className="close-page page-shell">
    <div className="page-title-row"><div><button className="back-link" onClick={onBack}><ArrowLeft size={17} /> Volver a la consola</button><span className="eyebrow">CIERRE ADMINISTRATIVO</span><h1>Cierre de la atención</h1><p>Revisa los datos de la atención antes de confirmar.</p></div><Button variant="primary" icon={<CheckCircle2 size={18} />} onClick={onConfirm}>Confirmar cierre</Button></div>
    <section className="review-person card"><div className="review-heading"><div><span className="step-number">1</span><div><h2>Datos de la persona atendida</h2><p>Información básica vinculada a esta atención.</p></div></div><span className="ok-label"><CheckCircle2 size={17} /> Datos completos</span></div><div className="review-person-grid"><div><small>Nombre y apellidos</small><strong>{person.name} {person.surnames}</strong></div><div><small>Identificación</small><strong>{person.id}</strong></div><div><small>Idioma</small><strong>{person.language}</strong></div><div><small>Tratamiento</small><strong>{person.treatment}</strong></div><div><small>Código postal</small><strong>{person.postalCode}</strong></div><div><small>Canal e inicio</small><strong>{channel} · {startTime}</strong></div></div></section>
    <section className="review-cases card"><div className="review-heading"><div><span className="step-number">2</span><div><h2>Datos de casos de atención</h2><p>{cases.length} casos · {cases.reduce((sum, item) => sum + item.services.length, 0)} servicios realizados</p></div></div><span className="logic-note"><Info size={15} /> Estado calculado según servicios y tareas</span></div>
      <div className="review-case-list">{cases.map((item, index) => <article className="review-case" key={item.id}><div className="review-case-header"><div><span className="case-index">CASO {index + 1}</span><h3>{item.procedure.name} <small>— {item.procedure.type}</small></h3></div><StatusBadge status={caseStatus(item)} /></div><ServiceTable services={item.services} />
        <label className="inline-notes"><span>Observaciones del caso</span><textarea value={item.notes} onChange={(event) => onUpdateCase({ ...item, notes: event.target.value })} /></label>
        <div className="tasks-block"><div className="tasks-title"><strong>Tareas</strong><Button variant="ghost" icon={<Plus size={15} />} onClick={() => onAddTask(item.id)}>Añadir tarea</Button></div>{item.tasks.length ? item.tasks.map((task) => <label className="task-row" key={task.id}><input type="checkbox" checked={task.done} onChange={(event) => onUpdateCase({ ...item, tasks: item.tasks.map((entry) => entry.id === task.id ? { ...entry, done: event.target.checked } : entry) })} /><span className={task.done ? 'done' : ''}>{task.text}</span><StatusBadge status={task.done ? 'Completado' : 'Pendiente'} /></label>) : <div className="no-tasks"><CheckCircle2 size={16} /> No hay tareas pendientes en este caso.</div>}</div>
      </article>)}</div>
    </section>
    <div className="close-footer"><div><CheckCircle2 size={20} /><span><strong>Todo listo para confirmar</strong><small>La atención quedará cerrada y conservará la trazabilidad de sus casos.</small></span></div><Button onClick={onBack}>Seguir revisando</Button><Button variant="primary" icon={<Check size={17} />} onClick={onConfirm}>Confirmar</Button></div>
  </main>
}

function LaguntzaileView({ item, person, onBack, onDerive, onToast }: { item: AttentionCase, person?: Person, onBack: () => void, onDerive: () => void, onToast: (message: string) => void }) {
  return <main className="laguntzaile page-shell"><div className="laguntzaile-bar"><div><span className="dynamics-grid"><span /><span /><span /><span /></span><strong>Bizkaia</strong><small>CRM · ESPACIO AISLADO DE DEMO</small></div><div className="fake-search"><Search size={15} /> Buscar en Dynamics 365</div></div><div className="command-bar"><button onClick={onBack}><ArrowLeft size={16} /> Volver a consola</button><button onClick={onDerive}><Send size={15} /> Derivar</button><button onClick={() => onToast('Ficha actualizada (simulación)')}><RefreshCw size={15} /> Actualizar</button><button onClick={() => onToast('Cambios guardados en la maqueta')}><ClipboardCheck size={15} /> Guardar</button></div>
    <div className="record-header"><div><span>Demanda · {item.id}</span><h1>{item.procedure.name}</h1><p>Ficha formal de expediente en Laguntzaile</p></div><div><span><small>Estado</small><strong>En curso</strong></span><span><small>Prioridad</small><strong>Normal</strong></span><span><small>Propietario</small><strong>{item.procedure.department}</strong></span></div></div>
    <div className="record-grid"><section className="record-section"><h2>Datos de la demanda</h2><div className="record-fields"><label>Código<input readOnly value={item.id} /></label><label>Origen<input readOnly value="Consola Atención Ciudadana" /></label><label>Tipo<input readOnly value={item.procedure.type} /></label><label>Gestor departamental<input readOnly value={item.derived?.manager ?? item.procedure.department} /></label><label>Tema<input readOnly value={item.procedure.topic} /></label><label>Ciudadano/a<input readOnly value={person ? `${person.name} ${person.surnames}` : 'No identificado'} /></label></div><h2>Contenido de la demanda</h2><label className="record-description">Resumen<textarea readOnly value={item.notes} /></label></section><aside className="record-side"><div><h2>Datos de contacto</h2><dl><dt>Nombre</dt><dd>{person?.name ?? '—'}</dd><dt>Apellidos</dt><dd>{person?.surnames ?? '—'}</dd><dt>Identificación</dt><dd>{person?.id ?? '—'}</dd><dt>Idioma</dt><dd>{person?.language ?? '—'}</dd><dt>Código postal</dt><dd>{person?.postalCode ?? '—'}</dd></dl></div><div className="sla-box"><Clock3 size={20} /><span><small>Tiempo de respuesta</small><strong>Dentro de plazo</strong></span></div></aside></div>
  </main>
}

function SuccessModal({ channel, person, cases, onNew, onConsole }: { channel: Channel, person: Person, cases: AttentionCase[], onNew: () => void, onConsole: () => void }) {
  const services = cases.reduce((sum, item) => sum + item.services.length, 0)
  return <Modal title="Atención cerrada correctamente" subtitle="La información ha quedado registrada en la maqueta." onClose={onConsole}><div className="success-hero"><span><Check size={32} /></span><h3>Proceso completado</h3><p>La atención y sus casos quedan listos para consulta y seguimiento.</p></div><div className="success-summary"><div><small>Canal</small><strong>{channel}</strong></div><div><small>Persona</small><strong>{person.name} {person.surnames}</strong></div><div><small>Duración</small><strong>12 min</strong></div><div><small>Casos</small><strong>{cases.length}</strong></div><div><small>Servicios</small><strong>{services}</strong></div></div><div className="simulation-note"><Info size={16} /><span>Esta confirmación es simulada. No se ha enviado información a Dynamics 365.</span></div><div className="modal-actions split"><Button onClick={onConsole}>Volver a consola</Button><Button variant="primary" icon={<Plus size={16} />} onClick={onNew}>Nueva atención</Button></div></Modal>
}

export default function App() {
  const [channel, setChannel] = useState<Channel>('Presencial')
  const [started, setStarted] = useState(false)
  const [startTime, setStartTime] = useState<string>()
  const [person, setPerson] = useState<Person>()
  const [representative, setRepresentative] = useState(false)
  const [cases, setCases] = useState<AttentionCase[]>([])
  const [activeId, setActiveId] = useState<string>()
  const [view, setView] = useState<View>('console')
  const [modal, setModal] = useState<ModalName>(null)
  const [taskCaseId, setTaskCaseId] = useState<string>()
  const [integrationName, setIntegrationName] = useState('')
  const [toast, setToast] = useState<string>()
  const activeCase = cases.find((item) => item.id === activeId)

  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast((current) => current === message ? undefined : current), 3600) }
  const beginAttention = () => { if (!started) { setStarted(true); setStartTime(new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })); notify(channel === 'Presencial' ? 'Turno 115 llamado a mesa 4' : 'Llamada aceptada · Atención iniciada') } else notify(channel === 'Presencial' ? 'El turno 115 ya está siendo atendido' : 'La llamada ya está en curso') }
  const updateCase = (updated: AttentionCase) => setCases((items) => items.map((item) => item.id === updated.id ? updated : item))
  const createCase = (procedure: Procedure) => {
    const item: AttentionCase = { id: `CAS-26-${String(cases.length + 1).padStart(3, '0')}`, procedure, notes: '', tasks: [], interestedPerson: person, services: [{ id: uid('S'), name: 'Consulta', result: 'Completado', notes: procedure.id === 'TR-001' ? 'Información inicial facilitada.' : 'Demanda identificada en la consola.' }] }
    setCases((current) => [...current, item]); setActiveId(item.id); setModal(null); notify(`Caso “${procedure.name}” creado`)
  }
  const reset = (nextChannel: Channel = 'Presencial') => { setChannel(nextChannel); setStarted(false); setStartTime(undefined); setPerson(undefined); setRepresentative(false); setCases([]); setActiveId(undefined); setView('console'); setModal(null); setToast(undefined) }
  const loadActive = (nextChannel: Channel = 'Presencial', many = false) => { const loaded = seededCases(); setChannel(nextChannel); setStarted(true); setStartTime('10:08'); setPerson(people[0]); setRepresentative(false); setCases(many ? loaded : [loaded[0]]); setActiveId(loaded[0].id); setView('console'); setModal(null); setToast(undefined) }
  const handleScenario = (scenario: string) => {
    if (scenario === 'presencial-start' || scenario === 'reset') reset('Presencial')
    if (scenario === 'phone-start') reset('Telefónico')
    if (scenario === 'presencial-active') loadActive('Presencial')
    if (scenario === 'multi') loadActive('Presencial', true)
    if (scenario === 'close') { loadActive('Presencial', true); setView('close') }
  }
  const switchChannel = (next: Channel) => { if (next === channel) return; reset(next); notify(`Escenario ${next.toLowerCase()} preparado`) }

  return <div className="app">
    <AppHeader channel={channel} onScenario={handleScenario} />
    {view === 'close' && person ? <CloseAttention person={person} cases={cases} channel={channel} startTime={startTime} onBack={() => setView('console')} onConfirm={() => setModal('success')} onUpdateCase={updateCase} onAddTask={(id) => { setTaskCaseId(id); setModal('task') }} /> : view === 'laguntzaile' && activeCase ? <LaguntzaileView item={activeCase} person={person} onBack={() => setView('console')} onDerive={() => setModal('derive')} onToast={notify} /> : <main className="console-page page-shell">
      <div className="console-title"><div><span className="eyebrow">HUB ÚNICO DE ATENCIÓN</span><h1>Consola del agente</h1><p>Gestión de atención y casos</p></div><div className="channel-switch" aria-label="Escenario demo"><span>Escenario demo</span><div><button className={channel === 'Presencial' ? 'active' : ''} onClick={() => switchChannel('Presencial')}><MapPin size={15} /> Presencial</button><button className={channel === 'Telefónico' ? 'active' : ''} onClick={() => switchChannel('Telefónico')}><Phone size={15} /> Telefónico</button></div></div></div>
      <div className="console-grid">
        <div className="left-column"><AttentionPanel started={started} startTime={startTime} channel={channel} person={person} representative={representative} cases={cases} onRepresentative={setRepresentative} onPerson={setPerson} onClose={() => setView('close')} onToast={notify} /><CasesList cases={cases} activeId={activeId} enabled={Boolean(person)} onSelect={setActiveId} onAdd={() => setModal('procedure')} /></div>
        <div className="center-column">{activeCase ? <><ActiveCase item={activeCase} onUpdate={updateCase} onAddService={() => setModal('service')} onDerive={() => setModal('derive')} onLaguntzaile={() => setView('laguntzaile')} onIntegration={(name) => { setIntegrationName(name); setModal('integration') }} /><InterestedPerson activeCase={activeCase} attended={person} onUpdate={(interested) => updateCase({ ...activeCase, interestedPerson: interested })} onToast={notify} /></> : <EmptyActiveCase enabled={Boolean(person)} onAdd={() => setModal('procedure')} />}</div>
        <div className="right-column">{channel === 'Presencial' ? <TurnPanel started={started} onStart={beginAttention} onRepeat={() => notify('Llamada repetida: turno 115, mesa 4')} /> : <TelephonyPanel started={started} onStart={beginAttention} onToast={notify} />}</div>
      </div>
    </main>}

    {modal === 'procedure' && <ProcedureModal onClose={() => setModal(null)} onCreate={createCase} onQuick={(label) => { setModal(null); notify(`${label}: integración simulada en la maqueta`) }} />}
    {modal === 'service' && activeCase && <AddServiceModal onClose={() => setModal(null)} onSave={(service) => { updateCase({ ...activeCase, services: [...activeCase.services, service] }); setModal(null); notify('Servicio añadido al caso') }} />}
    {modal === 'derive' && activeCase && <DerivationModal item={activeCase} onClose={() => setModal(null)} onSave={(derived) => { updateCase({ ...activeCase, derived }); setModal(null); notify('Demanda derivada correctamente') }} />}
    {modal === 'task' && taskCaseId && <AddTaskModal caseName={cases.find((item) => item.id === taskCaseId)?.procedure.name ?? ''} onClose={() => setModal(null)} onSave={(text) => { setCases((items) => items.map((item) => item.id === taskCaseId ? { ...item, tasks: [...item.tasks, { id: uid('T'), text, done: false }] } : item)); setModal(null); notify('Tarea añadida al caso') }} />}
    {modal === 'integration' && <Modal title={integrationName} subtitle="Acceso a aplicación de apoyo" onClose={() => setModal(null)}><div className="integration-message"><span><ExternalLink size={26} /></span><h3>Integración simulada en la maqueta</h3><p>En una solución real, este acceso abriría <strong>{integrationName}</strong> con el contexto de la persona y el caso activos.</p></div><div className="modal-actions"><Button variant="primary" onClick={() => setModal(null)}>Entendido</Button></div></Modal>}
    {modal === 'success' && person && <SuccessModal channel={channel} person={person} cases={cases} onConsole={() => { setModal(null); setView('console') }} onNew={() => reset(channel)} />}
    {toast && <Toast message={toast} onClose={() => setToast(undefined)} />}
  </div>
}
