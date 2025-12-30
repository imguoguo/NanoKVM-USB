import { ReactElement } from 'react';
import { useAtomValue } from 'jotai';

import { mouseModeAtom } from '@/jotai/mouse.ts';

import { Absolute } from './absolute.tsx';
import { Relative } from './relative.tsx';

export const Mouse = (): ReactElement => {
  const mouseMode = useAtomValue(mouseModeAtom);

  return <>{mouseMode === 'relative' ? <Relative /> : <Absolute />}</>;
};
