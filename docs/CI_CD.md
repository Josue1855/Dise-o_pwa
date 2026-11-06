# PWA CI/CD — Gorilla Escape

This fork has CI for every PR and push to develop/main, plus on-demand runs.
It checks the PWA manifest and source shell, builds with the locked npm
dependencies, and runs a production-dependency vulnerability audit. The build
is retained as a GitHub Actions artifact for 30 days.

Tag `pwa-vX.Y.Z` after review to publish a source-derived static build to
GitHub Releases. This is **not** an APK, hosted deployment, validated mobile
connection, or a playable Unity build.

The Node 24 workflow runs the complete `npm test` suite: laboratory contract
tests, controller state/sensor fixtures, service-worker behavior and real HTTP
proxy routing against isolated upstream fixtures. These do not certify physical
phones or Unity gameplay. Optional browser scripts and real Spring Boot/SQLite
verification are documented in [CONTROL_INTEGRATION.md](CONTROL_INTEGRATION.md);
they are separate from the default CI checks. The upstream repository is
`Quintana-117/Dise-o_pwa`; changes here must be reviewed and integrated
there by a collaborator with write access.

Never store tokens or secrets in this repo; use repository/environment secrets.
