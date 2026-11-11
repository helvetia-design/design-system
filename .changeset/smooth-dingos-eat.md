---
'@helvetia-design/skills': patch
---

**skills**: Migrate imperative modal code in ds-migrate-from-baloise: Angular `componentProps` move to `DS_MODAL_DATA`, `present()` after `create` is removed, `modalService.dismiss()` becomes `DsModalRef.dismiss()`, ref `open()`/`close()` become `present()`/`dismiss()` or the `open` prop, and React code outside components uses `dsModalController` with `defineCustomElement`
