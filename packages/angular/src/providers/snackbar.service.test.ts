import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { DsSnackbarService } from './snackbar.service'

const create = vi.fn()
const remove = vi.fn()
const removeAll = vi.fn()
const defineDsAlertContainer = vi.fn()
const defineDsSnackbar = vi.fn()

vi.mock('@helvetia-design/core', () => ({
  dsSnackbarController: {
    create: (...args: unknown[]) => create(...args),
    remove: (...args: unknown[]) => remove(...args),
    removeAll: (...args: unknown[]) => removeAll(...args),
  },
}))

vi.mock('@helvetia-design/core/components/ds-alert-container.js', () => ({
  defineCustomElement: (...args: unknown[]) => defineDsAlertContainer(...args),
}))

vi.mock('@helvetia-design/core/components/ds-snackbar.js', () => ({
  defineCustomElement: (...args: unknown[]) => defineDsSnackbar(...args),
}))

describe('DsSnackbarService', () => {
  beforeEach(() => {
    create.mockResolvedValue('snackbar-1')
    remove.mockResolvedValue(undefined)
    removeAll.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('registers ds-alert-container and ds-snackbar on construction', () => {
    new DsSnackbarService()

    expect(defineDsAlertContainer).toHaveBeenCalledTimes(1)
    expect(defineDsSnackbar).toHaveBeenCalledTimes(1)
  })

  test('create forwards the options with defaults applied and resolves with the id', async () => {
    const closeHandler = vi.fn()

    const id = await new DsSnackbarService().create({ heading: 'Saved', message: 'Done', closeHandler })

    expect(id).toBe('snackbar-1')
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

  test('dismiss removes the snackbar with the given id', async () => {
    await new DsSnackbarService().dismiss('snackbar-1')

    expect(remove).toHaveBeenCalledWith('snackbar-1')
  })

  test('dismiss does nothing without an id', async () => {
    await new DsSnackbarService().dismiss(undefined)

    expect(remove).not.toHaveBeenCalled()
  })

  test('dismissAll removes every snackbar', async () => {
    await new DsSnackbarService().dismissAll()

    expect(removeAll).toHaveBeenCalledTimes(1)
  })
})
