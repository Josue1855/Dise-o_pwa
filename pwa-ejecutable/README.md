# Frontend de la PWA del ejecutable

Copia de [MotionRelay](https://github.com/Josue1855/Gorilla-Escape/tree/f6718c196d3871510f99fccc15dfb4ad7dce9a9a/Unity/MotionRelay). Sirve esta carpeta como sitio estático. Para usar el control y consultar resultados, el origen del frontend debe enrutar `/motion` y `/results` al [relay de la PWA](https://github.com/Josue1855/Gorilla-Escape-Backend/tree/develop/pwa-relay). Para un teléfono, usa HTTPS.

Los recursos del cliente usan rutas relativas. La imagen de fondo apunta al commit de origen y requiere conexión. La interfaz conserva su color de fondo si la imagen no está disponible.

```bash
node pwa-ejecutable/control.test.cjs
node pwa-ejecutable/profile.test.cjs
```
