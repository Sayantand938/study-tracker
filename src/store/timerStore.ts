import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { getAllSessions, addSession, addSessions, clearAllSessions } from '@/lib/db';
import type { Session } from '@/types';

// --- Module-level helpers for timer loop ---
let rafId: number | null = null;
let isProcessing = false;

// --- LocalStorage keys ---
const RUNNING_KEY = 'timerIsRunning';
const START_TIME_KEY = 'timerStartTime';

// Read initial state from localStorage
const storedIsRunning = localStorage.getItem(RUNNING_KEY) === 'true';
const storedStartTime = localStorage.getItem(START_TIME_KEY)
    ? new Date(JSON.parse(localStorage.getItem(START_TIME_KEY)!))
    : null;

// Compute initial time if running
let initialTime = 0;
if (storedIsRunning && storedStartTime) {
    initialTime = Math.floor((Date.now() - storedStartTime.getTime()) / 1000);
}

interface TimerStore {
    // State
    time: number;
    isRunning: boolean;
    startTime: Date | null;
    history: Session[];
    loading: boolean;
    historyVersion: number; // <-- new: guard against stale updates

    // Actions
    loadHistory: () => Promise<void>;
    startTimer: () => void;
    stopTimer: () => void;
    resetTimer: () => void;
    replaceHistory: (newHistory: Session[]) => Promise<void>;
    clearHistory: () => Promise<void>;
}

// Store creation
const useTimerStore = create<TimerStore>()(
    devtools(
        (set, get) => ({
            time: initialTime,
            isRunning: storedIsRunning,
            startTime: storedStartTime,
            history: [],
            loading: true,
            historyVersion: 0, // initial version

            loadHistory: async () => {
                try {
                    const sessions = await getAllSessions();
                    set({ history: sessions, loading: false });
                } catch (err) {
                    console.error('Failed to load history:', err);
                    set({ history: [], loading: false });
                }
            },

            startTimer: () => {
                if (isProcessing) return;
                isProcessing = true;

                const now = new Date();
                set({
                    isRunning: true,
                    startTime: now,
                    time: 0,
                });
                localStorage.setItem(RUNNING_KEY, 'true');
                localStorage.setItem(START_TIME_KEY, JSON.stringify(now.getTime()));

                if (!rafId) {
                    const update = () => {
                        const { isRunning, startTime } = get();
                        if (isRunning && startTime) {
                            const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
                            set({ time: elapsed });
                            rafId = requestAnimationFrame(update);
                        } else {
                            rafId = null;
                        }
                    };
                    rafId = requestAnimationFrame(update);
                }

                isProcessing = false;
            },

            stopTimer: () => {
                if (isProcessing) return;
                isProcessing = true;

                const { isRunning, startTime, historyVersion } = get();
                if (!isRunning || !startTime) {
                    isProcessing = false;
                    return;
                }

                const endTime = new Date();
                const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

                // Cancel animation loop
                if (rafId) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                }

                set({
                    isRunning: false,
                    startTime: null,
                    time: 0,
                });
                localStorage.removeItem(RUNNING_KEY);
                localStorage.removeItem(START_TIME_KEY);

                // Save session to IndexedDB
                if (duration > 0) {
                    const session: Session = {
                        id: crypto.randomUUID(),
                        startTime,
                        endTime,
                        duration,
                    };
                    const versionAtStop = historyVersion; // capture current version
                    addSession(session)
                        .then(() => {
                            // Only apply if history hasn't been replaced/cleared since stop
                            set((state) => {
                                if (state.historyVersion !== versionAtStop) {
                                    // Stale update – discard
                                    return {};
                                }
                                return {
                                    history: [...state.history, session],
                                    historyVersion: state.historyVersion + 1,
                                };
                            });
                        })
                        .catch(console.error);
                } else {
                    // No session to save, but we still increment version to mark a change
                    set((state) => ({ historyVersion: state.historyVersion + 1 }));
                }

                isProcessing = false;
            },

            resetTimer: () => {
                if (isProcessing) return;
                isProcessing = true;

                const { isRunning } = get();
                if (isRunning) {
                    if (rafId) {
                        cancelAnimationFrame(rafId);
                        rafId = null;
                    }
                    set({
                        isRunning: false,
                        startTime: null,
                        time: 0,
                    });
                    localStorage.removeItem(RUNNING_KEY);
                    localStorage.removeItem(START_TIME_KEY);
                } else {
                    set({ time: 0 });
                }

                isProcessing = false;
            },

            replaceHistory: async (newHistory: Session[]) => {
                await clearAllSessions();
                if (newHistory.length > 0) {
                    await addSessions(newHistory);
                }
                set((state) => ({
                    history: newHistory,
                    historyVersion: state.historyVersion + 1,
                }));
            },

            clearHistory: async () => {
                await clearAllSessions();
                set((state) => ({
                    history: [],
                    historyVersion: state.historyVersion + 1,
                }));
            },
        }),
        { name: 'timer-store' }
    )
);

// Immediately load history
useTimerStore.getState().loadHistory();

export default useTimerStore;