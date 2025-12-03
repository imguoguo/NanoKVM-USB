import { useState, useRef } from 'react';
import { Video } from 'lucide-react';
import { camera } from '@/libs/camera';

export const Recorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder>();
  const recordedChunksRef = useRef<Blob[]>([]);

  const handleStartRecording = () => {

    const stream = camera.getStream();
    if (!stream) {
      return;
    }

    try {
      recordedChunksRef.current = [];

      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm'
      });

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const chunks = recordedChunksRef.current;

        if (chunks.length === 0) {
          return;
        }

        const blob = new Blob(chunks, { type: 'video/webm' });

        try {
          // Check if browser support File System Access API
          if ('showSaveFilePicker' in window) {
            const handle = await (window as any).showSaveFilePicker({
              suggestedName: `recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`,
              types: [{
                description: 'Sipeed NanoKVM-USB Recorder',
                accept: { 'video/webm': ['.webm'] }
              }]
            });

            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();

          } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
            a.click();
            URL.revokeObjectURL(url);
          }
        } catch (err: any) {
          console.error(err);
        }
      };

      recorder.start();
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
