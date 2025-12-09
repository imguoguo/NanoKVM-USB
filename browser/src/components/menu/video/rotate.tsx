import { ReactElement } from 'react'
import { Popover, Slider } from 'antd'
import { useAtom } from 'jotai'
import { ScalingIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { videoRotateAtom } from '@/jotai/device.ts';
import * as storage from '@/libs/storage';

export const Rotate = (): ReactElement => {
  const { t } = useTranslation()

  const [videoRotate, setVideoRotate] = useAtom(videoRotateAtom)

  async function updateRotate(rotate: number): Promise<void> {
    setVideoRotate(rotate)
    storage.setVideoRotate(rotate)
  }

  const content = (
    <div className="h-[150px] w-[60px] py-3">
      <Slider
        vertical
        marks={{
          0: <span>0</span>,
          90: <span>90</span>,
          180: <span>180</span>,
          270: <span>270</span>
        }}
        range={false}
        included={false}
        min={0}
        max={270}
        step={90}
        defaultValue={videoRotate}
        onChange={updateRotate}
      />
    </div>
  )

  return (
    <Popover content={content} placement="rightTop" arrow={false} align={{ offset: [13, 0] }}>
      <div className="flex h-[30px] cursor-pointer items-center space-x-1 rounded px-3 text-neutral-300 hover:bg-neutral-700/50">
        <div className="flex h-[14px] w-[20px] items-end">
          <ScalingIcon size={16} />
        </div>
        <span>{t('video.rotate')}</span>
      </div>
    </Popover>
  )
}
