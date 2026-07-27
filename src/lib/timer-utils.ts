import type { Session } from '@/types';

export const formatTime = (date: Date | null) => {
    if (!date) return 'Ongoing';
    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
};

export const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
};

export const getShift = (date: Date): number => {
    const hours = date.getHours();
    if (hours >= 0 && hours < 12) return 1;
    if (hours >= 12 && hours < 16) return 2;
    if (hours >= 16 && hours < 20) return 3;
    return 4;
};

export const calculateShiftTotals = (history: Session[]): number[] => {
    const totals = [0, 0, 0, 0];
    // Only include completed sessions (duration > 0 or endTime not null)
    history.forEach((session) => {
        if (session.endTime === null) return; // skip active
        const shift = getShift(session.startTime);
        totals[shift - 1] += session.duration;
    });
    return totals;
};

/**
 * Generate a unique ID (UUID v4 compatible) using crypto.getRandomValues,
 * with a fallback for older browsers.
 */
export function generateId(): string {
    // Use crypto.getRandomValues if available
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const arr = new Uint8Array(16);
        crypto.getRandomValues(arr);
        // Set version (4) and variant (RFC4122)
        arr[6] = (arr[6] & 0x0f) | 0x40;
        arr[8] = (arr[8] & 0x3f) | 0x80;
        const hex = Array.from(arr)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
    } else {
        // Fallback: timestamp + random (not perfect but works for a local app)
        return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    }
}


// Add this at the end of the file
export function getOverlapSeconds(
    sessionStart: Date,
    sessionEnd: Date,
    slotStart: Date,
    slotEnd: Date
): number {
    const start = Math.max(sessionStart.getTime(), slotStart.getTime());
    const end = Math.min(sessionEnd.getTime(), slotEnd.getTime());
    if (end <= start) return 0;
    return Math.floor((end - start) / 1000);
}