# Laboratorio PWA con SQLite

La pantalla real de integración está en `/lab.html`. El mando histórico de `/index.html` sigue siendo una demostración y no es evidencia de conexión Unity.

```bash
npm ci
npm test
npm run build
npm run lab
```

Con el backend del [PR #14](https://github.com/Josue1855/Gorilla-Escape-Backend/pull/14) iniciado en loopback8090, abrir http://127.0.0.1:4173/lab.html. Node24/JDK21 para desarrollo; no es el instalador autocontenido final. El servidor de laboratorio sólo escucha loopback y proxya /api/players al backend local. No exponerlo a Internet.

**Entrega, pruebas, capturas reales y pasos reproducibles:** [dossier central](https://github.com/Josue1855/Gorilla-Escape-Backend/tree/feature/players-sqlite-increment/docs/laboratorio).

La PWA consulta SQLite real, permite registrar jugadores, conserva la última consulta y borrador en IndexedDB, y recarga el shell compilado desde Cache Storage. No inventa competidores cuando no hay red. La reconexión requiere envío manual; no se ofrece Background Sync ni reintento automático. POST incierto queda bloqueado incluso tras recargar hasta revisión explícita. Nombres de jugadores no se escriben en logs de aplicación.

Para comprobar offline, usar la compilación (`npm run build` + `npm run lab`), no el servidor Vite. Service Worker necesita contexto seguro: loopback es válido para el laboratorio local; un móvil LAN necesita HTTPS confiable en una tarea posterior. API no se guarda en Cache Storage: el snapshot etiquetado se administra en IndexedDB. La primera página está limitada a100 filas.

El repositorio original de Hiram sólo permite lectura y sólo tenía main. Se creó este fork con develop sobre ese baseline y rama codex/pwa-database-lab. No se cambió main ni el upstream; no hay merge automático. La incorporación al upstream requiere revisión del mantenedor. Las capturas literales de DevTools siguen pendientes según el dossier; los JSON técnicos no se etiquetan como capturas.

## Resultados trazables

[CI del frontend](https://github.com/Josue1855/Dise-o_pwa/actions/runs/38989521358), commit `69084f5`: siete tests, build y npm audit PASS. [CI backend Linux/Windows](https://github.com/Josue1855/Gorilla-Escape-Backend/actions/runs/38989509375), commit `3635186`: 17 tests por plataforma y harness adicional Linux PASS. Estos resultados corresponden a esas revisiones; los cambios posteriores de documentación no son una nueva ejecución física. El dossier backend es privado: el docente requiere acceso o recibir las evidencias por el medio autorizado.
