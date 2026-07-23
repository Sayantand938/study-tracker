import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
    getAllSessions,
    createSession,
    updateSession,
    clearAllSessions,
    addSessions,
    deleteSessionById,
} from '@/lib/db';
import type { Session } from '@/types';
import { getElapsed, startLoop, stopLoop } from '@/lib/timer-loop';

// --- Module-level helper for concurrency ---
let isProcessing = false;

interface TimerStore {
    // State
    time: number;
    isRunning: boolean;
    activeSession: Session | null;
    history: Session[];
    loading: boolean;
    historyVersion: number;

    // Actions
    loadData: () => Promise<void>;
    startTimer: () => Promise<void>;
    stopTimer: () => Promise<void>;
    resetTimer: () => Promise<void>; // Now async and deletes the session
    replaceHistory: (newHistory: Session[]) => Promise<void>;
    clearHistory: () => Promise<void>;
}

const useTimerStore = create<TimerStore>()(
    devtools(
        (set, get) => ({
            time: 0,
            isRunning: false,
            activeSession: null,
            history: [],
            loading: true,
            historyVersion: 0,

            // Load both history and active session on startup
            loadData: async () => {
                try {
                    const sessions = await getAllSessions();
                    const active = sessions.find(s => s.endTime === null) || null;

                    let initialTime = 0;
                    if (active) {
                        initialTime = getElapsed(active);
                    }

                    set({
                        history: sessions,
                        activeSession: active,
                        isRunning: !!active,
                        time: initialTime,
                        loading: false,
                    });

                    // If there's an active session, start the UI loop
                    if (active) {
                        startLoop();
                    }
                } catch (err) {
                    console.error('Failed to load data:', err);
                    set({ history: [], activeSession: null, loading: false });
                }
            },

            startTimer: async () => {
                if (isProcessing) return;
                isProcessing = true;

                const { activeSession } = get();

                // If there's already an active session, just ensure the loop is running
                if (activeSession) {
                    startLoop(); // safe, no-op if already running
                    isProcessing = false;
                    return;
                }

                // Create a new session in the database
                const now = new Date();
                const session: Session = {
                    id: crypto.randomUUID(),
                    startTime: now,
                    endTime: null,
                    duration: 0,
                };

                try {
                    await createSession(session);
                    set((state) => ({
                        activeSession: session,
                        isRunning: true,
                        time: 0,
                        history: [...state.history, session],
                        historyVersion: state.historyVersion + 1,
                    }));
                    startLoop();
                } catch (err) {
                    console.error('Failed to create session:', err);
                } finally {
                    isProcessing = false;
                }
            },

            stopTimer: async () => {
                if (isProcessing) return;
                isProcessing = true;

                const { activeSession } = get();
                if (!activeSession) {
                    isProcessing = false;
                    return;
                }

                // Stop the UI loop
                stopLoop();

                const endTime = new Date();
                const duration = Math.floor((endTime.getTime() - activeSession.startTime.getTime()) / 1000);

                try {
                    // Update the session in DB
                    await updateSession(activeSession.id, { endTime, duration });

                    // Update state: mark as not running, clear active, set time to 0
                    set((state) => {
                        const updatedHistory = state.history.map(s =>
                            s.id === activeSession.id
                                ? { ...s, endTime, duration }
                                : s
                        );
                        return {
                            activeSession: null,
                            isRunning: false,
                            time: 0,
                            history: updatedHistory,
                            historyVersion: state.historyVersion + 1,
                        };
                    });
                } catch (err) {
                    console.error('Failed to stop timer:', err);
                } finally {
                    isProcessing = false;
                }
            },

            // NEW: Reset = Delete the active session permanently
            resetTimer: async () => {
                if (isProcessing) return;
                isProcessing = true;

                const { activeSession } = get();

                // 1. Stop the UI animation loop
                stopLoop();

                // 2. If there is an active session, delete it permanently from the database
                if (activeSession) {
                    try {
                        await deleteSessionById(activeSession.id);

                        // 3. Remove it from state and reset the display
                        set((state) => ({
                            activeSession: null,
                            isRunning: false,
                            time: 0,
                            history: state.history.filter(s => s.id !== activeSession.id),
                            historyVersion: state.historyVersion + 1,
                        }));
                    } catch (err) {
                        console.error('Failed to delete active session:', err);
                        // Still reset UI to avoid confusion
                        set({ time: 0, isRunning: false, activeSession: null });
                    }
                } else {
                    // If no active session, just reset the UI timer to 00:00
                    set({ time: 0 });
                }

                isProcessing = false;
            },

            replaceHistory: async (newHistory: Session[]) => {
                await clearAllSessions();
                if (newHistory.length > 0) {
                    await addSessions(newHistory);
                }
                stopLoop();
                set({
                    history: newHistory,
                    activeSession: null,
                    isRunning: false,
                    time: 0,
                    historyVersion: get().historyVersion + 1,
                });
            },

            clearHistory: async () => {
                await clearAllSessions();
                stopLoop();
                set({
                    history: [],
                    activeSession: null,
                    isRunning: false,
                    time: 0,
                    historyVersion: get().historyVersion + 1,
                });
            },
        }),
        { name: 'timer-store' }
    )
);

// Immediately load data
useTimerStore.getState().loadData();

export default useTimerStore;