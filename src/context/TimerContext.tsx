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
    id: string;
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

    // 🔒 Processing lock to prevent double‑click race conditions
    const isProcessingRef = useRef(false);

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

    // Timer update loop – safe, as cleanup cancels any scheduled RAF
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
    }, [isRunning, startTime]);

    const startTimer = () => {
        // Prevent double‑click
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        const now = new Date();
        setStartTime(now);
        setIsRunning(true);
        timeRef.current = 0;
        setTime(0);

        isProcessingRef.current = false;
    };

    const stopTimer = () => {
        // Prevent double‑click
        if (isProcessingRef.current || !isRunning || !startTime) return;
        isProcessingRef.current = true;

        const endTime = new Date();
        const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
        if (duration > 0) {
            const session: Session = {
                id: crypto.randomUUID(),
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

        isProcessingRef.current = false;
    };

    const resetTimer = () => {
        // Prevent double‑click
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

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

        isProcessingRef.current = false;
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