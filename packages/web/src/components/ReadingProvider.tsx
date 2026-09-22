import {
  createContext,
  type FC,
  type PropsWithChildren,
  useContext,
  useState,
} from 'react';
import type { Reading } from '../lib/reading';

type ReadingState = {
  /** 自分が読み取った結果。まだ読んでいなければ null（見本は /sample） */
  reading: Reading | null;
  setReading: (reading: Reading) => void;
};

const ReadingContext = createContext<ReadingState | undefined>(undefined);

/** 読み取り結果を画面間で受け渡す（保存はしない。再読み込みで消える） */
export const ReadingProvider: FC<PropsWithChildren> = ({ children }) => {
  const [reading, setReading] = useState<Reading | null>(null);
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
