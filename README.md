# Gorilla Escape — PWA y laboratorio de jugadores

Fork de trabajo de [Quintana-117/Dise-o_pwa](https://github.com/Quintana-117/Dise-o_pwa). Autor original de la interfaz de mando: Hiram. Esta rama añade un laboratorio de persistencia; no sustituye el cliente técnico Unity/Java del monorepo.

## Ejecutar el laboratorio

Con Node24/npm y el backend Spring Boot del [PR #14](https://github.com/Josue1855/Gorilla-Escape-Backend/pull/14) iniciado en 127.0.0.1:8090:

```bash
npm ci
npm test
npm run build
npm run lab
```

Abrir http://127.0.0.1:4173/lab.html. El servidor Node sólo escucha loopback; sirve dist y proxya `/api/players` al backend. Es una herramienta de laboratorio, no el instalador del videojuego. Backend requiere JDK21 para desarrollo; primera descarga de dependencias requiere Internet.

## Dos pantallas, alcances distintos

| Entrada | Estado y responsabilidad |
|---|---|
| `/lab.html` | React → GET/POST reales → Spring Boot/JDBC → SQLite. Listado paginado, registro validado, mensajes de error y estado local offline. Integración comprobada en Chrome de escritorio. |
| `/index.html` | Demostración histórica del mando y avatares JSONPlaceholder. Los botones modifican estado local; no acreditan conexión RTC/Unity ni gameplay real. |

`LabApp.jsx` coordina formulario/listado; `player-api.js` valida contrato y clasifica errores; `lab-store.js` guarda estado en IndexedDB. El transporte de controles del monorepo no se modifica.

## PWA y offline implementados

- `public/manifest.json` y `public/icons/lab.svg` se copian a dist. `tools/build-worker.mjs` genera `dist/sw.js` a partir de los assets compilados con hash; no precachea archivos JSX fuente.
- Cache Storage contiene sólo app shell del mismo origen. API y POST quedan excluidos del Service Worker. No existen competidores de rescate ni respuestas SQL ficticias en el laboratorio.
- IndexedDB `gorilla-players-lab-v1/state` guarda la última consulta y el borrador. La consulta local se etiqueta como posiblemente desactualizada; un borrador no es una fila confirmada en SQLite.
- Sin conexión se puede recargar después de una visita online y conservar el borrador. Volver online no envía POST automáticamente; requiere acción explícita. No hay Background Sync.
- Un envío de resultado incierto se marca antes de transmitir y queda bloqueado tras recargar hasta reconciliación. No se promete idempotencia backend ni reintento automático.

Para comprobar offline usar `npm run build` + `npm run lab`; el modo Vite de desarrollo no registra el worker del laboratorio. Loopback es un contexto seguro para SW. Un móvil por LAN requiere HTTPS confiable y una tarea de integración posterior; no se certifica soporte físico por usar localhost.

## Validación y entrega

Siete pruebas de cliente, build Vite6.4.4 y auditoría npm sin vulnerabilidades reportadas: [CI PASS](https://github.com/Josue1855/Dise-o_pwa/actions/runs/38989521358) en commit `69084f5`. React18.3.1, plugin-react4.7.0; versiones completas en package-lock.json.

[Dossier central con capturas auténticas, SQL, logs, red y almacenamiento](https://github.com/Josue1855/Gorilla-Escape-Backend/tree/feature/players-sqlite-increment/docs/laboratorio). [Guía local](docs/LABORATORIO.md). Quedan tres capturas literales de DevTools Network/Application/Console; JSON CDP no se presenta como captura. Prueba LAN/WAN física, teléfono e instalador final pendientes. Backend privado: el evaluador necesita acceso o el paquete autorizado de evidencias.

## Colaboración

Trabajo en ramas desde develop → PR a develop; main queda reservado para entregas aprobadas. [PR #1 del fork](https://github.com/Josue1855/Dise-o_pwa/pull/1), sin merge automático. El upstream original sólo ofrece main y permisos READ a esta cuenta; requiere que el mantenedor habilite develop y revise la incorporación. No se modificó su main ni se enviará un PR dirigido a main.
