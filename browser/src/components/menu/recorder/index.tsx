import { useState, useRef } from 'react';
import { Video } from 'lucide-react';
import { camera } from '@/libs/camera';

export const Recorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder>();
  const fileWritableRef = useRef<FileSystemWritableFileStream>(null);

  const handleStartRecording = async () => {

    const stream = camera.getStream();
    if (!stream) {
      return;
    }

    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: `recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`,
        types: [{
          description: 'Sipeed NanoKVM-USB Recorder',
          accept: { 'video/webm': ['.webm'] }
        }]
      });

      const writable = await handle.createWritable();
      fileWritableRef.current = writable;

      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm'
      });

      recorder.ondataavailable = async (event) => {
        if (event.data && event.data.size > 0) {
          if (fileWritableRef.current) {
            await fileWritableRef.current.write(event.data);
          } else {
            recorder.stop();
          }
        }
      };

      recorder.onstop = async () => {
        if (fileWritableRef.current) {
          await fileWritableRef.current.close();
          fileWritableRef.current = null;
        }
        setIsRecording(false);
      };

      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded text-white hover:bg-neutral-700/70"
    onClick={isRecording ? handleStopRecording : handleStartRecording}>
      <Video className={isRecording ? 'text-red-400 animate-pulse' : ''} size={18} />
    </div>
  );
};
