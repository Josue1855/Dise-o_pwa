import React, { useEffect, useRef, useState } from 'react';
import { api, isPlayer, validateName } from './player-api.js';
import { readState, saveState } from './lab-store.js';

const messages = {
  NETWORK_UNCERTAIN: 'No se pudo confirmar la respuesta. Si intentaste registrar, consulta el listado antes de volver a enviar: el servidor podría haber guardado el jugador.',
  VALIDATION_FAILED: 'El servidor rechazó el nombre. Corrige los datos.',
  STORAGE_UNAVAILABLE: 'El almacenamiento del servidor no está disponible.',
  INVALID_RESPONSE: 'La respuesta del servidor no cumple el contrato.'
};
export default function LabApp() {
  const [players, setPlayers] = useState([]), [snapshot, setSnapshot] = useState(null);
  const [name, setName] = useState(''), [message, setMessage] = useState('Preparando almacenamiento local…');
  const [ready, setReady] = useState(false), [busy, setBusy] = useState(false), [cached, setCached] = useState(false);
  const [online, setOnline] = useState(navigator.onLine), [storageError, setStorageError] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const sending = useRef(false);
  async function refresh() {
    setBusy(true);
    try {
      const result = await api('GET');
      const value = { items: result.data.items, savedAt: new Date().toISOString() };
      setPlayers(value.items); setSnapshot(value.savedAt); setCached(false);
      try { await saveState('snapshot', value); } catch { setStorageError(true); }
      setMessage(`Consulta confirmada: HTTP ${result.status}. ${value.items.length} jugadores (primera página, máximo 100).`);
      console.info(`event=players_rendered count=${value.items.length} source=backend`);
    } catch (error) { setCached(true); setMessage(messages[error.code] ?? `Error HTTP ${error.status || 'de red'}. Se conserva la última consulta local, si existe.`); }
    finally { setBusy(false); }
  }
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [saved, draft] = await Promise.all([readState('snapshot'), readState('draft')]);
        if (!active) return;
        if (saved && Array.isArray(saved.items) && saved.items.every(isPlayer)) { setPlayers(saved.items); setSnapshot(saved.savedAt); setCached(true); }
        if (draft) { setName(draft.name ?? ''); setUncertain(Boolean(draft.uncertain)); }
      } catch { if (active) setStorageError(true); }
      if (active) { setReady(true); await refresh(); }
    })();
    const up = () => { setOnline(true); setMessage('Red disponible. Pulsa Actualizar para consultar el backend; el borrador no se envía automáticamente.'); };
    const down = () => { setOnline(false); setCached(true); setMessage('Sin conexión. Consulta local disponible si fue guardada. El borrador permanece en este dispositivo.'); };
    window.addEventListener('online', up); window.addEventListener('offline', down);
    return () => { active = false; window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, []);
  // Uncertain POSTs remain blocked across reloads until explicitly reconciled by the user.
  async function changeName(value) {
    setName(value);
    try { await saveState('draft', { name: value, uncertain }); } catch { setStorageError(true); }
  }
  async function submit(event) {
    event.preventDefault();
    if (sending.current || uncertain) return;
    const normalized = validateName(name);
    if (!normalized) { setMessage('Nombre inválido: usa entre 1 y 40 caracteres, letras, números, espacios, punto, apóstrofe, guion o guion bajo.'); return; }
    if (!navigator.onLine) { setMessage('Sin conexión: borrador guardado localmente; todavía no está registrado en SQLite.'); return; }
    sending.current = true; setBusy(true);
    // Persist uncertainty BEFORE transmission: a closed tab must not silently retry.
    try { await saveState('draft', { name, uncertain: true }); }
    catch { setStorageError(true); setMessage('No se pudo proteger el borrador. No se envió la solicitud.'); setBusy(false); sending.current = false; return; }
    setUncertain(true);
    try {
      const result = await api('POST', normalized);
      setPlayers(current => [...current.filter(p => p.id !== result.data.id), result.data]);
      try { await saveState('draft', { name: '', uncertain: false }); setUncertain(false); setName(''); }
      catch { setStorageError(true); }
      setCached(false); setMessage(`Registro confirmado: HTTP 201. UUID ${result.data.id}. Pulsa Actualizar para confirmar también por GET.`);
    } catch (error) {
      // Definitive 4xx validation failures cannot have committed; network/5xx remain uncertain.
      if ([400, 409, 413, 415].includes(error.status)) {
        try { await saveState('draft', { name, uncertain: false }); setUncertain(false); } catch { setStorageError(true); }
      }
      setMessage(messages[error.code] ?? `No se confirmó el registro (HTTP ${error.status || 'sin respuesta'}). Consulta antes de reintentar.`);
    } finally { sending.current = false; setBusy(false); }
  }
  async function reconcile() {
    try { await saveState('draft', { name, uncertain: false }); setUncertain(false); setMessage('Revisión reconocida. Sólo vuelve a enviar si confirmaste que no existe el registro.'); }
    catch { setStorageError(true); }
  }
  return <main>
    <header><p className="eyebrow">GORILLA ESCAPE · GORILIMPIADAS</p><h1>Laboratorio de jugadores</h1><p>PWA React → Spring Boot → SQLite local</p></header>
    <section className="status"><span className={online ? 'pill' : 'pill offline'}>{online ? 'Red disponible' : 'Sin conexión'}</span><span>{cached ? 'Última consulta local · puede estar desactualizada' : 'Datos recibidos del backend'}</span></section>
    <p className="notice" role="status" aria-live="polite">{message}</p>
    {storageError && <p role="alert" className="warning">No se pudo guardar algún dato local. No se garantiza su conservación al cerrar esta pestaña.</p>}
    <section className="card"><h2>Registrar jugador</h2><p>Sin conexión puedes preparar un borrador. Se envía sólo al pulsar Registrar con conexión.</p>
      <form onSubmit={submit}><label htmlFor="display-name">Nombre del jugador</label><input id="display-name" value={name} onChange={e => changeName(e.target.value)} disabled={!ready || busy || uncertain} autoComplete="off" maxLength={80} required /><div className="buttons"><button type="submit" disabled={!ready || busy || uncertain}>Registrar jugador</button><button type="button" className="secondary" onClick={() => setMessage('El borrador se guarda al escribir en IndexedDB; no se ha enviado al backend.')} disabled={!ready}>Ver estado del borrador</button></div></form>
      {uncertain && <div className="warning"><p>Envío pendiente de confirmar. Revisa el listado y los logs antes de volver a enviar.</p><button className="secondary" disabled={busy} onClick={reconcile}>Ya revisé si se guardó</button></div>}
    </section>
    <section className="card"><div className="row"><h2>Jugadores registrados</h2><button className="secondary" onClick={refresh} disabled={!ready || busy}>Actualizar listado</button></div>
      <p>Última consulta guardada: {snapshot ? new Date(snapshot).toLocaleString('es-MX') : 'todavía no hay copia local'}.</p>
      {busy && <p role="status">Procesando solicitud…</p>}
      {players.length ? <ul className="players">{players.map(player => <li key={player.id}><strong>{player.displayName}</strong><code>{player.id}</code><small>{player.createdAt}</small></li>)}</ul> : <p>No hay jugadores disponibles en esta vista.</p>}
    </section>
    <footer>Los borradores no son registros confirmados. Sin reintentos automáticos ni Background Sync. Transporte de controles Unity/Java sin cambios.</footer>
  </main>;
}
