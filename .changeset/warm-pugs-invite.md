---
'@helvetia-design/react': patch
---

**react**: `useModal` now registers `ds-modal` itself. `dsModalController.create()` builds the element with `document.createElement('ds-modal')`, which leaves it un-upgraded unless something has registered the tag — and nothing in the imperative path did. An app that only ever presents modals through the hook, without also rendering a `<Modal>` or `<DsModal>` wrapper somewhere, got an inert element and no modal. This matches what `useToast` and `useSnackbar` already do through `useAlertController`.
