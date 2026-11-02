---
'@helvetia-design/skills': patch
---

**skills**: `ds-migrate-from-baloise`'s React rewrite for `balToastController`, `balSnackbarController` and `balModalController` now targets the `useToast`, `useSnackbar` and `useModal` hooks from `@helvetia-design/react` instead of the bare controllers from `@helvetia-design/core`. The controllers build their host element with `document.createElement()` and register no custom element, so a bare import left it un-upgraded and `create()` threw `addAlert is not a function`. HTML and Angular keep the controller import, since their path was never affected.
