import { useContext } from 'react';
import { TempLogCtx } from './TempLogContext';

export function useTempLog() {
  return useContext(TempLogCtx);
}
