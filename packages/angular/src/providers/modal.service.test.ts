import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { DsModalService } from './modal.service'
import { DsModalRef } from './modal-ref'
import type { AngularDelegate } from './angular-delegate'

const create = vi.fn()
const defineDsModal = vi.fn()

vi.mock('@helvetia-design/core', () => ({
  dsModalController: {
    create: (...args: unknown[]) => create(...args),
  },
}))

vi.mock('@helvetia-design/core/components/ds-modal.js', () => ({
  defineCustomElement: (...args: unknown[]) => defineDsModal(...args),
}))

class TestComponent {}

const delegate = {} as AngularDelegate

describe('DsModalService', () => {
  let element: HTMLDsModalElement

  beforeEach(() => {
    element = document.createElement('ds-modal') as HTMLDsModalElement
    create.mockResolvedValue(element)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('registers ds-modal on construction', () => {
    new DsModalService(delegate)

    expect(defineDsModal).toHaveBeenCalledTimes(1)
  })

  test('create passes component, props, options and delegate to the controller', async () => {
    const props = { name: 'Ada' }

    await new DsModalService(delegate).create(TestComponent, props, { closable: false, modalWidth: 480 })

    expect(create).toHaveBeenCalledWith({
      closable: false,
      modalWidth: 480,
      component: TestComponent,
      componentProps: props,
      delegate,
    })
  })

  test('create returns the ref for the created element', async () => {
    const ref = await new DsModalService(delegate).create(TestComponent)

    expect(ref).toBe(DsModalRef.for(element))
  })
})
