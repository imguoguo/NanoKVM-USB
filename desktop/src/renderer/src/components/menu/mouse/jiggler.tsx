import { ReactElement } from 'react'
import { Popover } from 'antd'
import clsx from 'clsx'
import { useAtom } from 'jotai'
import { MousePointerIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { mouseJigglerModeAtom } from '@renderer/jotai/mouse'
import * as storage from '@renderer/libs/storage'

export const Jiggler = (): ReactElement => {
  const { t } = useTranslation()
  const [mouseJigglerMode, setMouseJigglerMode] = useAtom(mouseJigglerModeAtom)

  const mouseJigglerModes: { name: string; value: 'enable' | 'disable' }[] = [
    { name: t('mouse.jiggler.enable'), value: 'enable' },
    { name: t('mouse.jiggler.disable'), value: 'disable' }
  ]

  function update(mode: 'enable' | 'disable'): void {
    setMouseJigglerMode(mode)
    storage.setMouseJigglerMode(mode)
  }

  const content = (
    <>
      {mouseJigglerModes.map((mode) => (
        <div
          key={mode.value}
          className={clsx(
            'my-1 flex cursor-pointer items-center space-x-1 rounded py-1 pl-2 pr-5 hover:bg-neutral-700/50',
            mode.value === mouseJigglerMode ? 'text-blue-500' : 'text-neutral-300'
          )}
          onClick={() => update(mode.value)}
        >
          <span className="text-sm">{mode.name}</span>
        </div>
      ))}
    </>
  )
  return (
    <Popover content={content} placement="rightTop" arrow={false} align={{ offset: [13, 0] }}>
      <div className="flex h-[30px] cursor-pointer items-center space-x-1 rounded px-3 text-neutral-300 hover:bg-neutral-700/50">
        <div className="flex h-[14px] w-[20px] items-end">
          <MousePointerIcon size={16} />
        </div>
        <span>{t('mouse.jiggler.title')}</span>
      </div>
    </Popover>
  )
}
