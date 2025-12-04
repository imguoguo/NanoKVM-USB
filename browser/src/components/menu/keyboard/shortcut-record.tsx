import { useRef, useState } from 'react';
import { Button, Input, Modal, Space } from 'antd';
import { SendHorizonal } from 'lucide-react';
import { modifierKeys, Modifiers, ShortcutProps } from '@/libs/device/keyboard.ts';

interface KeyboardShortcutRecordProps {
  addShortcut: (shortcut: ShortcutProps) => void;
}

export const KeyboardShortcutRecord = ({addShortcut}: KeyboardShortcutRecordProps) => {

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isRecordingShortcut, setIsRecordingShortcut] = useState<boolean>(false)
  const [shortcut, setShortcut] = useState<ShortcutProps | null>(null)
  const [shortcutLabel, setShortcutLabel] = useState<string>("")
  const [shortcutFixedLabel, setShortcutFixedLabel] = useState<string>("")
  const pressedModifiersRef = useRef<Set<string>>(new Set());

  function getPressedShortcutString(event: KeyboardEvent) {
    let pressedKey : string = "";
    pressedKey += event.ctrlKey ? "Ctrl + " : ""
    pressedKey += event.shiftKey ? "Shift + " : ""
    pressedKey += event.altKey ? "Alt + " : "";
    pressedKey += event.metaKey ? "Meta + " : "";
    pressedKey += !modifierKeys.has(event.key) ? event.key : "";
    return pressedKey;
  }

  function handleModelDone() {
    if (shortcut == null) {
      cleanShortcut();
      return;
    }
    addShortcut({
      modifiers: shortcut.modifiers,
      label: shortcutLabel,
      keyCode: shortcut.keyCode
    });
    cleanShortcut();
  }

  function cleanShortcut() {
    if (isRecordingShortcut) {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyDown);
    }

    setIsModalOpen(false);
    console.log(isModalOpen)
    setShortcut(null);
    setShortcutLabel("");
    setShortcutFixedLabel("");
  }

  async function handleKeyDown(event: KeyboardEvent) {
    console.log(event)
    event.preventDefault();
    event.stopPropagation();

    const label = getPressedShortcutString(event)
    setShortcutLabel(label);
    setShortcutFixedLabel(label);

    if (modifierKeys.has(event.key)) {
      if (event.type == "keydown") {
        pressedModifiersRef.current.add(event.code);
      } else {
        pressedModifiersRef.current.delete(event.code);
      }
    } else {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyDown);
      console.log(event)
      const modifiers = Modifiers.getModifiers(event, pressedModifiersRef.current);
      const ret : ShortcutProps = {
        modifiers: modifiers,
        label: label,
        keyCode: event.code,
      }
      setShortcut(ret)
    }

  }

  return <div
    className="flex h-[30px] cursor-pointer items-center space-x-1 rounded px-3 text-neutral-300 hover:bg-neutral-700/60"
    onClick={() => {
      setIsModalOpen(true);
    }}
  >
    <SendHorizonal size={18} />
    <span>录制快捷键</span>

    <Modal
      title="Title"
      open={isModalOpen}
      onOk={handleModelDone}
      onCancel={cleanShortcut}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Input
          placeholder="Shortcut Label"
          value={shortcutLabel}
          onChange={(e) => setShortcutLabel(e.target.value)}
        />
        <div>
          快捷键: {shortcutFixedLabel}
        </div>
        <Button onClick={() => {
          setIsRecordingShortcut(true);
          window.addEventListener('keydown', handleKeyDown);
          window.addEventListener('keyup', handleKeyDown);
        }}>
          Start recording
        </Button>
      </Space>
    </Modal>
  </div>
}
