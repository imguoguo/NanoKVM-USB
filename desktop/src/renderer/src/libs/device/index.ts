import { IpcEvents } from '@common/ipc-events'

import { Modifiers } from '../keyboard'
import { Key as MouseKey } from './mouse'
import { intToByte } from './utils'

export class Device {
  async sendKeyboardData(modifiers: Modifiers, keys: number[]): Promise<void> {
    if (keys.length !== 6) {
      throw new Error('keyboard keys length must be 6')
    }

    await window.electron.ipcRenderer.invoke(IpcEvents.SEND_KEYBOARD, modifiers.encode(), keys)
  }

  async sendMouseAbsoluteData(
    key: MouseKey,
    width: number,
    height: number,
    x: number,
    y: number,
    scroll: number
  ): Promise<void> {
    const keyCode = key.encode()

    await window.electron.ipcRenderer.invoke(
      IpcEvents.SEND_MOUSE_ABSOLUTE,
      keyCode,
      width,
      height,
      x,
      y,
      scroll
    )
  }

  async sendMouseRelativeData(
    msKey: MouseKey,
    x: number,
    y: number,
    scroll: number
  ): Promise<void> {
    const keyCode = msKey.encode()
    const xByte = intToByte(x)
    const yByte = intToByte(y)

    await window.electron.ipcRenderer.invoke(
      IpcEvents.SEND_MOUSE_RELATIVE,
      keyCode,
      xByte,
      yByte,
      scroll
    )
  }
}

export const device = new Device()
