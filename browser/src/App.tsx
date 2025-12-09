import { useEffect, useState, useRef, useCallback } from 'react';
import { Alert, Result, Spin } from 'antd';
import clsx from 'clsx';
import { useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from 'react-responsive';

import { DeviceModal } from '@/components/device-modal';
import { Keyboard } from '@/components/keyboard';
import { Menu } from '@/components/menu';
import { Mouse } from '@/components/mouse';
import { VirtualKeyboard } from '@/components/virtual-keyboard';
import {
  resolutionAtom,
  serialStateAtom,
  videoScaleAtom,
  videoStateAtom
} from '@/jotai/device.ts';
import { isKeyboardEnableAtom } from '@/jotai/keyboard.ts';
import { mouseStyleAtom } from '@/jotai/mouse.ts';
import { camera } from '@/libs/camera';
import { device } from '@/libs/device';
import * as storage from '@/libs/storage';
import type { Resolution } from '@/types.ts';

const App = () => {
  const { t } = useTranslation();
  const isBigScreen = useMediaQuery({ minWidth: 850 });

  const mouseStyle = useAtomValue(mouseStyleAtom);
  const videoScale = useAtomValue(videoScaleAtom);
  const videoState = useAtomValue(videoStateAtom);
  const serialState = useAtomValue(serialStateAtom);
  const isKeyboardEnable = useAtomValue(isKeyboardEnableAtom);
  const setResolution = useSetAtom(resolutionAtom);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isCameraAvailable, setIsCameraAvailable] = useState(false);

  const rotation = 90;

  const renderFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    // 如果 video 或 canvas 没了，或者 video 暂停/结束了，停止渲染以节省性能
    if (!video || !canvas || video.paused || video.ended) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    // 绘制视频
    ctx.drawImage(
      video,
      -video.videoWidth / 2,
      -video.videoHeight / 2,
      video.videoWidth,
      video.videoHeight
    );

    ctx.restore();

    requestRef.current = requestAnimationFrame(renderFrame);
  }, [rotation]); // 依赖 rotation

  // 3. 核心修复：这个函数绑定到 video 的 onLoadedMetadata 上
  const handleVideoMetadata = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // 确保视频开始播放
    video.play().catch(e => console.error("Auto-play failed:", e));

    // 根据旋转角度设置 Canvas 尺寸
    // 只要有数据进来，这里就会被调用，不用担心加载时机
    if (rotation % 180 === 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    } else {
      canvas.width = video.videoHeight;
      canvas.height = video.videoWidth;
    }

    // 防止多次触发导致 loop 加速，先取消旧的
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }

    // 开始渲染循环
    renderFrame();
  };

  useEffect(() => {
    const resolution = storage.getVideoResolution();
    if (resolution) {
      setResolution(resolution);
    }

    requestMediaPermissions(resolution);

    return () => {
      camera.close();
      device.serialPort.close();
    };
  }, []);

  async function requestMediaPermissions(resolution?: Resolution) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: resolution?.width || 1920 },
          height: { ideal: resolution?.height || 1080 }
        },
        audio: true
      });
      stream.getTracks().forEach((track) => track.stop());

      setIsCameraAvailable(true);
    } catch (err: any) {
      console.log('failed to request media permissions: ', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setIsCameraAvailable(false);
      } else {
        setIsCameraAvailable(true);
      }
    }

    setIsLoading(false);
  }

  if (isLoading) {
    return <Spin size="large" spinning={isLoading} tip={t('camera.tip')} fullscreen />;
  }

  if (!isCameraAvailable) {
    return (
      <Result
        status="info"
        title={t('camera.denied')}
        extra={[<h2 className="text-xl text-white">{t('camera.authorize')}</h2>]}
      />
    );
  }

  return (
    <>
      <DeviceModal />

      {videoState === 'connected' && (
        <>
          <Menu />

          {serialState === 'notSupported' && (
            <Alert message={t('serial.notSupported')} type="warning" banner closable />
          )}

          {serialState === 'connected' && (
            <>
              <Mouse />
              {isKeyboardEnable && <Keyboard />}
            </>
          )}
        </>
      )}

      <video
        id="video"
        className="hidden"
        ref={videoRef}
        autoPlay
        playsInline
        onLoadedMetadata={handleVideoMetadata}
      />

      <canvas
        id="video-canvas"
        ref={canvasRef}
        className={clsx('block min-h-[480px] min-w-[640px] select-none', mouseStyle)}
        style={{
          transform: `scale(${videoScale})`,
          transformOrigin: 'center',
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'scale-down'
        }}
      />

      <VirtualKeyboard isBigScreen={isBigScreen} />
    </>
  );
};

export default App;
