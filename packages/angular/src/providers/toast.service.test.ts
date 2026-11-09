import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { DsToastService } from './toast.service'

const create = vi.fn()
const remove = vi.fn()
const removeAll = vi.fn()
const defineDsAlertContainer = vi.fn()
const defineDsToast = vi.fn()

vi.mock('@helvetia-design/core', () => ({
  dsToastController: {
    create: (...args: unknown[]) => create(...args),
    remove: (...args: unknown[]) => remove(...args),
    removeAll: (...args: unknown[]) => removeAll(...args),
  },
}))

vi.mock('@helvetia-design/core/components/ds-alert-container.js', () => ({
  defineCustomElement: (...args: unknown[]) => defineDsAlertContainer(...args),
}))

vi.mock('@helvetia-design/core/components/ds-toast.js', () => ({
  defineCustomElement: (...args: unknown[]) => defineDsToast(...args),
}))

describe('DsToastService', () => {
  beforeEach(() => {
    create.mockResolvedValue('toast-1')
    remove.mockResolvedValue(undefined)
    removeAll.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('registers ds-alert-container and ds-toast on construction', () => {
    new DsToastService()

    expect(defineDsAlertContainer).toHaveBeenCalledTimes(1)
    expect(defineDsToast).toHaveBeenCalledTimes(1)
  })

  test('create forwards the options with defaults applied and resolves with the id', async () => {
    const closeHandler = vi.fn()

    const id = await new DsToastService().create({ heading: 'Saved', message: 'Done', closeHandler })

    expect(id).toBe('toast-1')
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        heading: 'Saved',
        message: 'Done',
        closable: false,
        closeHandler,
        actionHandler: expect.any(Function),
      }),
    )
  })

  test('dismiss removes the toast with the given id', async () => {
    await new DsToastService().dismiss('toast-1')

    expect(remove).toHaveBeenCalledWith('toast-1')
  })

  test('dismiss does nothing without an id', async () => {
    await new DsToastService().dismiss(undefined)

    expect(remove).not.toHaveBeenCalled()
  })

  test('dismissAll removes every toast', async () => {
    await new DsToastService().dismissAll()

    expect(removeAll).toHaveBeenCalledTimes(1)
  })
})
