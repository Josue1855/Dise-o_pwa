# PWA CI/CD — Gorilla Escape

This fork has CI for every PR and push to develop/main, plus on-demand runs.
It checks the PWA manifest and source shell, builds with the locked npm
dependencies, and runs a production-dependency vulnerability audit. The build
is retained as a GitHub Actions artifact for 30 days.

Tag `pwa-vX.Y.Z` after review to publish a source-derived static build to
GitHub Releases. This is **not** an APK, hosted deployment, validated mobile
connection, or a playable Unity build.

The tests under `tests/` are static smoke tests, **not** browser tests,
gamepad tests, real mobile tests, or backend integration tests. Add component
and browser/API integration tests when the maintained application actually
implements those capabilities. The upstream repository is
`Quintana-117/Dise-o_pwa`; changes here must be reviewed and integrated
there by a collaborator with write access.

Never store tokens or secrets in this repo; use repository/environment secrets.
