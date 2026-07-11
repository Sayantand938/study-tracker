import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Session = {
    id: number;
    startTime: Date;
    endTime: Date;
    duration: number; // in seconds
};

type TimerContextType = {
    time: number;
    isRunning: boolean;
    history: Session[];
    startTimer: () => void;
    stopTimer: () => void;
    resetTimer: () => void;
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [history, setHistory] = useState<Session[]>(() => {
        const stored = localStorage.getItem("timerHistory");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                return parsed.map((s: any) => ({
                    ...s,
                    startTime: new Date(s.startTime),
                    endTime: new Date(s.endTime),
                }));
            } catch {
                return [];
            }
        }
        return [];
    });

    // Persist history
    useEffect(() => {
        localStorage.setItem("timerHistory", JSON.stringify(history));
    }, [history]);

    // Timer tick
    useEffect(() => {
        let interval: number | null = null;
        if (isRunning && startTime) {
            interval = window.setInterval(() => {
                const now = Date.now();
                const elapsed = Math.floor((now - startTime.getTime()) / 1000);
                setTime(elapsed);
            }, 1000);
        } else if (interval) {
            clearInterval(interval);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRunning, startTime]);

    const startTimer = () => {
        const now = new Date();
        setStartTime(now);
        setIsRunning(true);
        setTime(0);
    };

    const stopTimer = () => {
        if (isRunning && startTime) {
            const endTime = new Date();
            const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
            if (duration > 0) {
                const session: Session = {
                    id: Date.now(),
                    startTime,
                    endTime,
                    duration,
                };
                setHistory((prev) => [session, ...prev]);
            }
            setIsRunning(false);
            setStartTime(null);
            setTime(0);
        }
    };

    const resetTimer = () => {
        if (isRunning) {
            // Stop without saving
            setIsRunning(false);
            setStartTime(null);
            setTime(0);
        } else {
            setTime(0);
        }
    };

    return (
        <TimerContext.Provider value={{ time, isRunning, history, startTimer, stopTimer, resetTimer }}>
            {children}
        </TimerContext.Provider>
    );
}

export function useTimer() {
    const context = useContext(TimerContext);
    if (context === undefined) {
        throw new Error("useTimer must be used within a TimerProvider");
    }
    return context;
}