import {
    useState,
    useEffect,
    type ReactNode,
    useRef,
} from 'react';
import {
    getAllSessions,
    addSession,
    addSessions,
    clearAllSessions,
} from '@/lib/db';
import { TimerContext, type Session } from './timer-context';

export function TimerProvider({ children }: { children: ReactNode }) {
    const [history, setHistory] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    // Load history on mount
    useEffect(() => {
        const load = async () => {
            try {
                const sessions = await getAllSessions();
                setHistory(sessions);
            } catch (err) {
                console.error('Failed to load history:', err);
                setHistory([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Timer state (localStorage for fast sync)
    const [isRunning, setIsRunning] = useState(() => {
        const stored = localStorage.getItem('timerIsRunning');
        return stored === 'true';
    });

    const [startTime, setStartTime] = useState<Date | null>(() => {
        const stored = localStorage.getItem('timerStartTime');
        if (stored) {
            try {
                return new Date(JSON.parse(stored));
            } catch {
                return null;
            }
        }
        return null;
    });

    const timeRef = useRef(0);
    const [time, setTime] = useState(() => {
        if (isRunning && startTime) {
            return Math.floor((Date.now() - startTime.getTime()) / 1000);
        }
        return 0;
    });

    // Sync ref with time after render
    useEffect(() => {
        timeRef.current = time;
    }, [time]);

    const rafIdRef = useRef<number | null>(null);
    const isProcessingRef = useRef(false);

    // Persist running state
    useEffect(() => {
        localStorage.setItem('timerIsRunning', String(isRunning));
    }, [isRunning]);

    useEffect(() => {
        if (startTime) {
            localStorage.setItem('timerStartTime', JSON.stringify(startTime.getTime()));
        } else {
            localStorage.removeItem('timerStartTime');
        }
    }, [startTime]);

    // Timer loop
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
            addSession(session).catch(console.error);
            setHistory((prev) => [...prev, session]);
        }
        setIsRunning(false);
        setStartTime(null);
        timeRef.current = 0;
        setTime(0);
        localStorage.removeItem('timerIsRunning');
        localStorage.removeItem('timerStartTime');

        isProcessingRef.current = false;
    };

    const resetTimer = () => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        if (isRunning) {
            setIsRunning(false);
            setStartTime(null);
            timeRef.current = 0;
            setTime(0);
            localStorage.removeItem('timerIsRunning');
            localStorage.removeItem('timerStartTime');
        } else {
            timeRef.current = 0;
            setTime(0);
        }

        isProcessingRef.current = false;
    };

    const replaceHistory = async (newHistory: Session[]) => {
        await clearAllSessions();
        if (newHistory.length > 0) {
            await addSessions(newHistory);
        }
        setHistory(newHistory);
    };

    const clearHistory = async () => {
        await clearAllSessions();
        setHistory([]);
    };

    return (
        <TimerContext.Provider
            value={{
                time,
                isRunning,
                history,
                loading,
                setHistory,
                replaceHistory,
                clearHistory,
                startTimer,
                stopTimer,
                resetTimer,
            }}
        >
            {children}
        </TimerContext.Provider>
    );
}