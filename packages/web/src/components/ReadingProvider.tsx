import {
  createContext,
  type FC,
  type PropsWithChildren,
  useContext,
  useState,
} from 'react';
import { SAMPLE_READING } from '../demo/sample';
import type { Reading } from '../lib/reading';

type ReadingState = {
  /** 表示中の読み取り結果。まだ何も読んでいなければ見本 */
  reading: Reading;
  setReading: (reading: Reading) => void;
};

const ReadingContext = createContext<ReadingState | undefined>(undefined);

/** 読み取り結果を画面間で受け渡す（保存はしない。再読み込みで見本に戻る） */
export const ReadingProvider: FC<PropsWithChildren> = ({ children }) => {
  const [reading, setReading] = useState<Reading>(SAMPLE_READING);
  return (
    <ReadingContext.Provider value={{ reading, setReading }}>
      {children}
    </ReadingContext.Provider>
  );
};

export const useReading = (): ReadingState => {
  const state = useContext(ReadingContext);
  if (!state) throw new Error('useReading must be used within ReadingProvider');
  return state;
};
