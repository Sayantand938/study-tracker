import { createContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export type Session = {
    id: string;
    startTime: Date;
    endTime: Date;
    duration: number;
};

export type TimerContextType = {
    time: number;
    isRunning: boolean;
    history: Session[];
    loading: boolean;
    setHistory: Dispatch<SetStateAction<Session[]>>;
    replaceHistory: (newHistory: Session[]) => Promise<void>;
    clearHistory: () => Promise<void>;
    startTimer: () => void;
    stopTimer: () => void;
    resetTimer: () => void;
};

export const TimerContext = createContext<TimerContextType | undefined>(undefined);