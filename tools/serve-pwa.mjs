// Mismo servidor loopback; la entrada principal abre el control del juego.
process.env.PWA_ENTRY = '/index.html';
await import('./serve-lab.mjs');
