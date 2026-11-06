# Gorilla Escape — PWA y laboratorio de jugadores

Fork de trabajo de [Quintana-117/Dise-o_pwa](https://github.com/Quintana-117/Dise-o_pwa). Autor original de la interfaz de mando: Hiram. Incluye el control React del juego, importado de Gorilla-Escape/PWA, el laboratorio de jugadores y la demo histórica conservada.

## Control del juego

Con Node 24/npm:

```bash
npm ci
npm test
npm run build
npm run serve
```

Abrir http://127.0.0.1:4173/. La pantalla pide el QR vigente de la PC; no simula una conexión. El servidor técnico del juego debe estar disponible en loopback :8080. El laboratorio utiliza un servidor distinto, Spring Boot :8090. `npm run dev` ofrece los mismos destinos de proxy en desarrollo. `npm run preview` sólo sirve archivos, sin estos proxies.

[Alcance del traslado, rutas y evidencias](docs/CONTROL_INTEGRATION.md). El servidor incluido escucha sólo en loopback y sirve para revisión local. Un teléfono requiere el origen HTTPS y el transporte del juego; el build estático por sí solo no los proporciona.

## Ejecutar el laboratorio

Con Node24/npm y el backend Spring Boot del [PR #14](https://github.com/Josue1855/Gorilla-Escape-Backend/pull/14) iniciado en 127.0.0.1:8090:

```bash
npm ci
npm test
npm run build
npm run lab
```

Abrir http://127.0.0.1:4173/lab.html. El servidor Node sólo escucha loopback; sirve dist y proxya `/api/players` al backend. Es una herramienta de laboratorio, no el instalador del videojuego. Backend requiere JDK21 para desarrollo; primera descarga de dependencias requiere Internet.

## Tres pantallas, alcances distintos

| Entrada | Estado y responsabilidad |
|---|---|
| `/lab.html` | React → GET/POST reales → Spring Boot/JDBC → SQLite. Listado paginado, registro validado, mensajes de error y estado local offline. Integración comprobada en Chrome de escritorio. |
| `/` y `/index.html` | Control del juego: admisión QR, nombre confirmado por la PC, permisos por gesto, sensores, reconexión, pausa y controles según la prueba. Requiere el servidor técnico del juego. |
| `/demo.html` | Demostración histórica del mando y avatares JSONPlaceholder. Los botones modifican estado local; no acreditan conexión RTC/Unity ni gameplay real. |

`App.jsx` y `controller/` coordinan el control; `input/` contiene transporte y captura. `LabApp.jsx` coordina formulario/listado; `player-api.js` valida contrato y clasifica errores; `lab-store.js` guarda estado en IndexedDB. No se modifica el protocolo del juego ni la API de jugadores.

## PWA y offline implementados

- `manifest.webmanifest` identifica el control; `manifest.json` y `icons/lab.svg` identifican el laboratorio. `tools/build-worker.mjs` invoca el generador común de `dist/sw.js` a partir de assets compilados con hash; no precachea archivos JSX fuente.
- Cache Storage contiene sólo app shell del mismo origen. API y POST quedan excluidos del Service Worker. No existen competidores de rescate ni respuestas SQL ficticias en el laboratorio.
- IndexedDB `gorilla-players-lab-v1/state` guarda la última consulta y el borrador. La consulta local se etiqueta como posiblemente desactualizada; un borrador no es una fila confirmada en SQLite.
- Sin conexión se puede recargar después de una visita online y conservar el borrador. Volver online no envía POST automáticamente; requiere acción explícita. No hay Background Sync.
- Un envío de resultado incierto se marca antes de transmitir y queda bloqueado tras recargar hasta reconciliación. No se promete idempotencia backend ni reintento automático.

Para comprobar offline usar `npm run build` + `npm run lab`; el modo Vite de desarrollo no registra el worker del laboratorio. Loopback es un contexto seguro para SW. Un móvil por LAN requiere HTTPS confiable y una tarea de integración posterior; no se certifica soporte físico por usar localhost.

## Validación y entrega

Revisión local del 5 de noviembre de 2026: **107 pruebas aprobadas**, build Vite **8.3.6**, React **19.3.0**, plugin-react **6.1.2** y auditoría npm con **cero vulnerabilidades reportadas**. Se comprobaron 33 vistas adaptables, y navegador → POST/GET → Spring Boot → SQLite real con datos temporales. También se verificó la recarga offline del control y del laboratorio. [Resultados y capturas](docs/CONTROL_INTEGRATION.md). Esto no certifica teléfono físico, sensores reales, WebRTC/Unity ni LAN/HTTPS.

[Dossier central con capturas auténticas, SQL, logs, red y almacenamiento](https://github.com/Josue1855/Gorilla-Escape-Backend/tree/feature/players-sqlite-increment/docs/laboratorio). [Guía local](docs/LABORATORIO.md). Quedan tres capturas literales de DevTools Network/Application/Console; JSON CDP no se presenta como captura. Prueba LAN/WAN física, teléfono e instalador final pendientes. Backend privado: el evaluador necesita acceso o el paquete autorizado de evidencias.

## Colaboración

Trabajo en ramas desde develop → PR a develop; main queda reservado para entregas aprobadas. [PR #1 del fork](https://github.com/Josue1855/Dise-o_pwa/pull/1), sin merge automático. El upstream original sólo ofrece main y permisos READ a esta cuenta; requiere que el mantenedor habilite develop y revise la incorporación. No se modificó su main ni se enviará un PR dirigido a main.
