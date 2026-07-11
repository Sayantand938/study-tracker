import { createContext, useContext, useState, useEffect, type ReactNode, useRef } from "react";

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
                return parsed
                    .map((s: any) => ({
                        ...s,
                        startTime: new Date(s.startTime),
                        endTime: new Date(s.endTime),
                    }))
                    .sort((a: Session, b: Session) => a.startTime.getTime() - b.startTime.getTime());
            } catch {
                return [];
            }
        }
        return [];
    });

    // Ref to hold the current animation frame ID so we can cancel it
    const rafIdRef = useRef<number | null>(null);

    // Persist history to localStorage
    useEffect(() => {
        localStorage.setItem("timerHistory", JSON.stringify(history));
    }, [history]);

    // Timer update loop using requestAnimationFrame
    useEffect(() => {
        const updateTimer = () => {
            if (isRunning && startTime) {
                const now = Date.now();
                const elapsed = Math.floor((now - startTime.getTime()) / 1000);
                // Only update state if the integer second changed
                if (elapsed !== time) {
                    setTime(elapsed);
                }
                // Continue the loop
                rafIdRef.current = requestAnimationFrame(updateTimer);
            }
        };

        if (isRunning && startTime) {
            // Start the loop
            rafIdRef.current = requestAnimationFrame(updateTimer);
        } else {
            // Stop the loop
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
        }

        // Cleanup on unmount or when dependencies change
        return () => {
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
        };
    }, [isRunning, startTime, time]); // time is included to compare against elapsed

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
                setHistory((prev) => [...prev, session]);
            }
            setIsRunning(false);
            setStartTime(null);
            setTime(0);
        }
    };

    const resetTimer = () => {
        if (isRunning) {
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