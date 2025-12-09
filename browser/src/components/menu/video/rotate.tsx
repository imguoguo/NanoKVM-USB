import { ReactElement } from 'react'
import { Popover } from 'antd'
import { useSetAtom } from 'jotai'
import { RotateCcwIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { videoRotateAtom } from '@/jotai/device.ts';
import * as storage from '@/libs/storage';

export const Rotate = (): ReactElement => {
  const { t } = useTranslation()
  const rotates = [0, 90, 180, 270];

  const setVideoRotate = useSetAtom(videoRotateAtom)

  async function updateRotate(rotate: number): Promise<void> {
    setVideoRotate(rotate)
    storage.setVideoRotate(rotate)
  }

  const content = (
    <>
      {rotates.map((rotate) => (
        <div
          key={rotate}
          className={
            'flex cursor-pointer select-none items-center space-x-1 rounded px-3 py-1.5 hover:bg-neutral-700/60'}
          onClick={() => updateRotate(rotate)}
        >
          <span className="w-[32px]">{rotate}°</span>
        </div>
      ))}
    </>
  )

  return (
    <Popover content={content} placement="rightTop" arrow={false} align={{ offset: [13, 0] }}>
      <div className="flex h-[30px] cursor-pointer items-center space-x-1 rounded px-3 text-neutral-300 hover:bg-neutral-700/50">
        <div className="flex h-[14px] w-[20px] items-end">
          <RotateCcwIcon size={16} />
        </div>
        <span>{t('video.rotate')}</span>
      </div>
    </Popover>
  )
}
