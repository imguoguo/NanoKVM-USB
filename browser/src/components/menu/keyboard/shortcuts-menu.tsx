import { useEffect, useState } from 'react';
import { Popover } from 'antd';
import { SendHorizonal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ShortcutProps } from '@/libs/device/keyboard.ts'


import { Shortcut } from './shortcut.tsx';


export const KeyboardShortcutsMenu = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [storedShortcuts, setStoredShortcuts] = useState<ShortcutProps[]>([]);
  const predefinedShortcuts : ShortcutProps[] = [
    {
      label: t('keyboard.ctrlAltDel'),
      modifiers: { leftCtrl: true, leftAlt: true },
      keyCode: 'Delete',
    },
    {
      label: t('keyboard.ctrlD'),
      modifiers: { leftCtrl: true },
      keyCode: 'KeyD',
    },
    {
      label: t('keyboard.winTab'),
      modifiers: { leftWindows: true },
      keyCode: 'Tab',
    },
  ]

  function saveShortcut(shortcut: ShortcutProps) {
    if (shortcut == null) return;

    let shortcuts = localStorage.getItem("shortcuts");
    if (shortcuts === null) {
      shortcuts = "[]";
    }

    const shortcutsObject: ShortcutProps[] = JSON.parse(shortcuts);
    shortcutsObject.push(shortcut);
    localStorage.setItem("shortcuts", JSON.stringify(shortcutsObject));
    setStoredShortcuts(shortcutsObject);
    // cleanShortcut();
  }

  useEffect(() => {
    if (localStorage.getItem("shortcuts") === null) {
      predefinedShortcuts.forEach(shortcut => {
        saveShortcut(shortcut);
      })
    }
  }, []);

  return (
    <Popover
      content={
        <div className="flex flex-col gap-1">
          {storedShortcuts.map((shortcut) => (
            <Shortcut
              key={shortcut.keyCode}
              label={shortcut.label}
              modifiers={shortcut.modifiers}
              keyCode={shortcut.keyCode}
            />
          ))}
        </div>
      }
      trigger="click"
      placement="rightTop"
      align={{ offset: [14, 0] }}
      open={open}
      onOpenChange={setOpen}
      arrow={false}
    >
      <div className="flex h-[30px] cursor-pointer items-center space-x-1 rounded px-3 text-neutral-300 hover:bg-neutral-700/60">
        <SendHorizonal size={18} />
        <span>{t('keyboard.shortcuts')}</span>
      </div>
    </Popover>
  );
};
