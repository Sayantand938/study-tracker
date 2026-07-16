import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
    useRef,
    type Dispatch,
    type SetStateAction,
} from "react";

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
    setHistory: Dispatch<SetStateAction<Session[]>>;
    startTimer: () => void;
    stopTimer: () => void;
    resetTimer: () => void;
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
    // Load initial state from localStorage
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

    const [isRunning, setIsRunning] = useState(() => {
        const stored = localStorage.getItem("timerIsRunning");
        return stored === "true";
    });

    const [startTime, setStartTime] = useState<Date | null>(() => {
        const stored = localStorage.getItem("timerStartTime");
        if (stored) {
            try {
                return new Date(JSON.parse(stored));
            } catch {
                return null;
            }
        }
        return null;
    });

    // Use a ref to keep the latest time without triggering re‑renders
    const timeRef = useRef(0);
    const [time, setTime] = useState(() => {
        if (isRunning && startTime) {
            const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
            timeRef.current = elapsed;
            return elapsed;
        }
        return 0;
    });

    const rafIdRef = useRef<number | null>(null);

    // Persist timer state to localStorage
    useEffect(() => {
        localStorage.setItem("timerIsRunning", String(isRunning));
    }, [isRunning]);

    useEffect(() => {
        if (startTime) {
            localStorage.setItem("timerStartTime", JSON.stringify(startTime.getTime()));
        } else {
            localStorage.removeItem("timerStartTime");
        }
    }, [startTime]);

    useEffect(() => {
        localStorage.setItem("timerHistory", JSON.stringify(history));
    }, [history]);

    // Timer update loop – now dependencies are only isRunning and startTime
    useEffect(() => {
        const updateTimer = () => {
            if (isRunning && startTime) {
                const now = Date.now();
                const elapsed = Math.floor((now - startTime.getTime()) / 1000);
                if (elapsed !== timeRef.current) {
                    timeRef.current = elapsed;
                    setTime(elapsed);
                }
                rafIdRef.current = requestAnimationFrame(updateTimer);
            }
        };

        if (isRunning && startTime) {
            rafIdRef.current = requestAnimationFrame(updateTimer);
        } else {
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
        }

        return () => {
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
        };
    }, [isRunning, startTime]); // <-- no `time` dependency

    const startTimer = () => {
        const now = new Date();
        setStartTime(now);
        setIsRunning(true);
        timeRef.current = 0;
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
            timeRef.current = 0;
            setTime(0);
            localStorage.removeItem("timerIsRunning");
            localStorage.removeItem("timerStartTime");
        }
    };

    const resetTimer = () => {
        if (isRunning) {
            setIsRunning(false);
            setStartTime(null);
            timeRef.current = 0;
            setTime(0);
            localStorage.removeItem("timerIsRunning");
            localStorage.removeItem("timerStartTime");
        } else {
            timeRef.current = 0;
            setTime(0);
        }
    };

    return (
        <TimerContext.Provider
            value={{
                time,
                isRunning,
                history,
                setHistory,
                startTimer,
                stopTimer,
                resetTimer,
            }}
        >
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