import { ReactElement, useEffect, useRef } from 'react'
import { useAtom, useAtomValue } from 'jotai'

import {
  mouseJigglerIntervalAtom,
  mouseJigglerModeAtom,
  mouseJigglerTimerAtom,
  mouseLastMoveTimeAtom,
  mouseModeAtom
} from '@renderer/jotai/mouse'
import { device } from '@renderer/libs/device'
import { Key } from '@renderer/libs/device/mouse'

import { Absolute } from './absolute'
import { Relative } from './relative'

export const Mouse = (): ReactElement => {
  const mouseMode = useAtomValue(mouseModeAtom)

  // mouse jiggler
  const mouseJigglerMode = useAtomValue(mouseJigglerModeAtom)
  const [mouseJigglerTimer, setMouseJigglerTimer] = useAtom(mouseJigglerTimerAtom)
  const mouseJigglerInterval = useAtomValue(mouseJigglerIntervalAtom)
  const mouseLastMoveTime = useAtomValue(mouseLastMoveTimeAtom)
  const mouseLastMoveTimeRef = useRef(mouseLastMoveTime)
  const emptyKeyRef = useRef<Key>(new Key())

  useEffect(() => {
    // sync mouseLastMoveTime through ref
    mouseLastMoveTimeRef.current = mouseLastMoveTime
  }, [mouseLastMoveTime])

  useEffect(() => {
    async function jigglerTimerCallback(): Promise<void> {
      if (Date.now() - mouseLastMoveTimeRef.current < mouseJigglerInterval) {
        return
      }

      const rect = document.getElementById('video')!.getBoundingClientRect()

      await device.sendMouseAbsoluteData(
        emptyKeyRef.current,
        rect.width,
        rect.height,
        rect.width / 2,
        rect.height / 2,
        0
      )
    }

    // configure interval timer
    if (mouseJigglerMode === 'enable') {
      if (mouseJigglerTimer === null) {
        const timer = setInterval(jigglerTimerCallback, mouseJigglerInterval)
        setMouseJigglerTimer(timer as unknown as number)
      }
    } else {
      if (mouseJigglerTimer) {
        clearInterval(mouseJigglerTimer as unknown as NodeJS.Timeout)
        setMouseJigglerTimer(null)
      }
    }
  }, [mouseJigglerMode])

  return <>{mouseMode === 'relative' ? <Relative /> : <Absolute />}</>
}
