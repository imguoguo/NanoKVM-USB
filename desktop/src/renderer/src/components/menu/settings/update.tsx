import { ReactElement, useEffect, useState } from 'react'
import { LoadingOutlined, RocketOutlined, SmileOutlined } from '@ant-design/icons'
import { Button, Divider, Progress, Result, Spin } from 'antd'
import { useTranslation } from 'react-i18next'

import { IpcEvents } from '@common/ipc-events.ts'

type Status = 'loading' | 'latest' | 'outdated' | 'downloading' | 'installing' | 'error'

export const Update = (): ReactElement => {
  const { t } = useTranslation()

  const [status, setStatus] = useState<Status>('loading')
  const [currentVersion, setCurrentVersion] = useState('')
  const [latestVersion, setLatestVersion] = useState('')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    getVersion()

    const rmUpdateAvailable = window.electron.ipcRenderer.on(
      IpcEvents.UPDATE_AVAILABLE,
      (_, info) => {
        if (info?.version) {
          setStatus('outdated')
          setLatestVersion(info.version)
        }
      }
    )

    const rmUpdateNotAvailable = window.electron.ipcRenderer.on(
      IpcEvents.UPDATE_NOT_AVAILABLE,
      () => {
        setStatus('latest')
      }
    )

    const rmDownloadProgress = window.electron.ipcRenderer.on(
      IpcEvents.DOWNLOAD_PROGRESS,
      (_, percent) => {
        setProgress(percent)
        if (percent >= 100) {
          setStatus('installing')
        }
      }
    )

    const rmUpdateDownloaded = window.electron.ipcRenderer.on(IpcEvents.UPDATE_DOWNLOADED, () => {
      setStatus('installing')
    })

    const rmUpdateError = window.electron.ipcRenderer.on(IpcEvents.UPDATE_ERROR, () => {
      setStatus('error')
    })

    return (): void => {
      rmUpdateAvailable()
      rmUpdateNotAvailable()
      rmDownloadProgress()
      rmUpdateDownloaded()
      rmUpdateError()
    }
  }, [])

  function getVersion(): void {
    window.electron.ipcRenderer.invoke(IpcEvents.GET_APP_VERSION).then((version) => {
      setCurrentVersion(version)
    })

    window.electron.ipcRenderer.invoke(IpcEvents.CHECK_FOR_UPDATES)
  }

  function update(): void {
    window.electron.ipcRenderer.send(IpcEvents.DOWNLOAD_UPDATE)
    setProgress(0)
    setStatus('downloading')
  }

  return (
    <>
      <div className="text-base font-bold">{t('settings.update.title')}</div>
      <Divider />

      {status === 'loading' && (
        <div className="flex justify-center pt-24">
          <Spin indicator={<LoadingOutlined spin />} size="large" />
        </div>
      )}

      {status === 'latest' && (
        <Result
          status="success"
          icon={<SmileOutlined />}
          title={currentVersion}
          subTitle={t('settings.update.latest')}
        />
      )}

      {status === 'outdated' && (
        <Result
          status="warning"
          icon={<RocketOutlined />}
          title={`${currentVersion} -> ${latestVersion}`}
          subTitle={t('settings.update.outdated')}
          extra={[
            <Button key="update" type="primary" onClick={update}>
              {t('settings.update.confirm')}
            </Button>
          ]}
        />
      )}

      {status === 'downloading' && (
        <div className="flex flex-col items-center justify-center space-y-10 pt-24">
          <Progress
            percent={progress}
            percentPosition={{ align: 'end', type: 'inner' }}
            size={[450, 20]}
          />
          <div />
          <span className="text-blue-500/70">{t('settings.update.downloading')}</span>
        </div>
      )}

      {status === 'installing' && (
        <div className="flex flex-col items-center justify-center space-y-10 pt-24">
          <Spin size="large" />
          <div />
          <span className="text-blue-500/70">{t('settings.update.installing')}</span>
        </div>
      )}

      {status === 'error' && <Result subTitle={t('settings.update.failed')} />}
    </>
  )
}
