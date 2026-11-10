---
'@helvetia-design/skills': minor
---

**skills**: Make `skills add` install safely: copy into a temp folder and swap it in with a rollback, write `.installed.json` with file hashes, exit 1 and list local edits unless `--force` is passed, and install into the project root (nearest folder with `package.json` and a lockfile) instead of the current folder
