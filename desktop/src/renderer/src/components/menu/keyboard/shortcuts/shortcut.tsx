import { useState } from 'react'

import { Kbd, KbdGroup } from '@renderer/components/ui/kbd'
import { Modifiers } from '@renderer/libs/device/keyboard'
import { KeyboardCodes } from '@renderer/libs/keyboard'
import { IpcEvents } from '@common/ipc-events'

import type { Shortcut as ShortcutInterface } from './types'

type ShortcutProps = {
  shortcut: ShortcutInterface
}

export const Shortcut = ({ shortcut }: ShortcutProps) => {
  const [isLoading, setIsLoading] = useState(false)

  async function send() {
    const modifiers = new Modifiers()
    const codes: number[] = []

    shortcut.keys.forEach((key) => {
      if (key.isModifier) {
        modifiers.setModifier(key.code)
      } else {
        const code = KeyboardCodes.get(key.code)
        if (code) {
          codes.push(code)
        }
      }
    })

    if (codes.length < 6) {
      codes.push(...new Array(6 - codes.length).fill(0x00))
    }

    await window.electron.ipcRenderer.invoke(IpcEvents.SEND_KEYBOARD, modifiers.encode(), codes)
    await window.electron.ipcRenderer.invoke(
      IpcEvents.SEND_KEYBOARD,
      new Modifiers().encode(),
      [0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
    )
  }

  async function handleClick(): Promise<void> {
    if (isLoading) return
    setIsLoading(true)

    try {
      await send()
    } catch (err) {
      console.log(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="flex h-[32px] w-full cursor-pointer items-center space-x-1 rounded px-3 hover:bg-neutral-700/30"
      onClick={handleClick}
    >
      {shortcut.keys.map((key, index) => (
        <KbdGroup key={index}>
          <Kbd>{key.label}</Kbd>
        </KbdGroup>
      ))}
    </div>
  )
}
