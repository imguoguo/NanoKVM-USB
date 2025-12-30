import { ReactElement } from 'react'
import { Popover } from 'antd'
import clsx from 'clsx'
import { LanguagesIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import languages from '@renderer/i18n/languages.ts'
import { setLanguage } from '@renderer/libs/storage/index.ts'

export const Language = (): ReactElement => {
  const { i18n } = useTranslation()

  function changeLanguage(lng: string): void {
    if (i18n.language === lng) return

    i18n.changeLanguage(lng)
    setLanguage(lng)
  }

  const content = (
    <>
      {languages.map((lng) => (
        <div
          key={lng.key}
          className={clsx(
            'flex cursor-pointer items-center space-x-1 rounded px-5 py-1 select-none',
            i18n.language === lng.key ? 'text-blue-500' : 'text-white hover:bg-neutral-700'
          )}
          onClick={() => changeLanguage(lng.key)}
        >
          {lng.name}
        </div>
      ))}
    </>
  )

  return (
    <Popover content={content} placement="bottomLeft" trigger="click" arrow>
      <div className="flex h-[28px] cursor-pointer items-center justify-center rounded px-2 text-white hover:bg-neutral-600/60">
        <LanguagesIcon size={18} />
      </div>
    </Popover>
  )
}
