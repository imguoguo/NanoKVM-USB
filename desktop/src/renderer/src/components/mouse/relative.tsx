import { ReactElement, useEffect, useRef } from 'react'
import { message } from 'antd'
import { useAtomValue, useSetAtom } from 'jotai'
import { useTranslation } from 'react-i18next'

import { resolutionAtom } from '@renderer/jotai/device'
import {
  mouseJigglerModeAtom,
  mouseLastMoveTimeAtom,
  scrollDirectionAtom,
  scrollIntervalAtom
} from '@renderer/jotai/mouse'
import { device } from '@renderer/libs/device'
import { Key } from '@renderer/libs/device/mouse'

export const Relative = (): ReactElement => {
  const { t } = useTranslation()
  const [messageApi, contextHolder] = message.useMessage()

  const resolution = useAtomValue(resolutionAtom)
  const scrollDirection = useAtomValue(scrollDirectionAtom)
  const scrollInterval = useAtomValue(scrollIntervalAtom)
  const mouseJigglerMode = useAtomValue(mouseJigglerModeAtom)
  const setMouseLastMoveTime = useSetAtom(mouseLastMoveTimeAtom)

  const isLockedRef = useRef(false)
  const keyRef = useRef<Key>(new Key())
  const lastScrollTimeRef = useRef(0)

  useEffect(() => {
    messageApi.open({
      key: 'relative',
      type: 'info',
      content: t('mouse.requestPointer'),
      duration: 3,
      style: {
        marginTop: '40vh'
      }
    })
  }, [])

  useEffect(() => {
    const canvas = document.getElementById('video')
    if (!canvas) return

    document.addEventListener('pointerlockchange', handlePointerLockChange)
    canvas.addEventListener('click', handleClick)
    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('wheel', handleWheel)
    canvas.addEventListener('contextmenu', disableEvent)

    function handlePointerLockChange(): void {
      isLockedRef.current = document.pointerLockElement === canvas
    }

    function handleClick(event: MouseEvent): void {
      disableEvent(event)

      if (!isLockedRef.current) {
        canvas!.requestPointerLock()
      }
    }

    async function handleMouseDown(event: MouseEvent): Promise<void> {
      disableEvent(event)

      switch (event.button) {
        case 0:
          keyRef.current.left = true
          break
        case 1:
          keyRef.current.mid = true
          break
        case 2:
          keyRef.current.right = true
          break
        default:
          console.log(`unknown button ${event.button}`)
          return
      }

      await send(0, 0, 0)
    }

    async function handleMouseUp(event: MouseEvent): Promise<void> {
      disableEvent(event)

      switch (event.button) {
        case 0:
          keyRef.current.left = false
          break
        case 1:
          keyRef.current.mid = false
          break
        case 2:
          keyRef.current.right = false
          break
        default:
          console.log(`unknown button ${event.button}`)
          return
      }

      await send(0, 0, 0)
    }

    async function handleMouseMove(event: any): Promise<void> {
      disableEvent(event)

      const x = event.movementX || event.mozMovementX || event.webkitMovementX || 0
      const y = event.movementY || event.mozMovementY || event.webkitMovementY || 0
      if (x === 0 && y === 0) return

      await send(Math.abs(x) < 10 ? x * 2 : x, Math.abs(y) < 10 ? y * 2 : y, 0)

      // mouse jiggler record last move time
      if (mouseJigglerMode === 'enable') {
        setMouseLastMoveTime(Date.now())
      }
    }

    async function handleWheel(event: WheelEvent): Promise<void> {
      disableEvent(event)

      const currentTime = Date.now()
      if (currentTime - lastScrollTimeRef.current < scrollInterval) {
        return
      }

      const delta = Math.floor(event.deltaY)
      if (delta === 0) return

      await send(0, 0, delta > 0 ? -1 * scrollDirection : scrollDirection)

      lastScrollTimeRef.current = currentTime
    }

    async function send(x: number, y: number, scroll: number): Promise<void> {
      await device.sendMouseRelativeData(keyRef.current, x, y, scroll)
    }

    return (): void => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange)
      canvas.removeEventListener('click', handleClick)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('wheel', handleWheel)
      canvas.removeEventListener('contextmenu', disableEvent)
    }
  }, [resolution, scrollDirection, scrollInterval, mouseJigglerMode, setMouseLastMoveTime])

  function disableEvent(event: MouseEvent): void {
    event.preventDefault()
    event.stopPropagation()
  }

  return <>{contextHolder}</>
}
