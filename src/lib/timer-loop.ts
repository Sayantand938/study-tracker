import type { Session } from '@/types';
import useTimerStore from '@/store/timerStore';

let rafId: number | null = null;

/**
 * Calculates elapsed seconds for a session.
 * If completed, returns the stored duration.
 * If active, calculates based on startTime and current time.
 */
export function getElapsed(session: Session): number {
    if (session.endTime !== null) return session.duration;
    const now = Date.now();
    return Math.floor((now - session.startTime.getTime()) / 1000);
}

/**
 * Starts the UI update loop.
 * It reads the active session from the store and updates `time` ~60fps.
 */
export function startLoop(): void {
    if (rafId) return; // already running

    const update = () => {
        const state = useTimerStore.getState();

        // If we have an active session and the timer is marked as running
        if (state.activeSession && state.isRunning) {
            const elapsed = getElapsed(state.activeSession);
            useTimerStore.setState({ time: elapsed });
            rafId = requestAnimationFrame(update);
        } else {
            rafId = null;
        }
    };

    rafId = requestAnimationFrame(update);
}

/**
 * Stops the UI update loop.
 */
export function stopLoop(): void {
    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
}

/**
 * Check if the loop is currently running.
 */
export function isLoopRunning(): boolean {
    return rafId !== null;
}