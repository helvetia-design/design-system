---
'@helvetia-design/skills': patch
---

**skills**: `ds-migrate-from-baloise`'s Init now adds `@helvetia-design/tokens` (which it writes a CSS import for) and `@helvetia-design/core` (which supplies the controller and option types, even in a React or Angular app) alongside the framework binding package. Previously only the binding package and `styles` were declared, so these two resolved only transitively — fine under npm's flat `node_modules`, broken under pnpm's strict layout.
