import { Injectable } from '@angular/core'
import { dsToastController } from '@helvetia-design/core'
import { defineCustomElement as defineDsAlertContainer } from '@helvetia-design/core/components/ds-alert-container.js'
import { defineCustomElement as defineDsToast } from '@helvetia-design/core/components/ds-toast.js'
import { toAlert, type DsAlertOptions } from './alert-options'

@Injectable({
  providedIn: 'root',
})
export class DsToastService {
  constructor() {
    defineDsAlertContainer()
    defineDsToast()
  }

  /**
   * Shows a toast and resolves with its id. Resolves with an empty string when an identical toast is
   * already visible.
   */
  async create(options: DsAlertOptions): Promise<string | undefined> {
    return dsToastController.create(toAlert(options))
  }

  async dismiss(id: string | undefined): Promise<void> {
    if (!id) return
    await dsToastController.remove(id)
  }

  async dismissAll(): Promise<void> {
    await dsToastController.removeAll()
  }
}
