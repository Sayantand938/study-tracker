import type { Session } from '@/types';

export const formatTime = (date: Date) => {
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
    history.forEach((session) => {
        const shift = getShift(session.startTime);
        totals[shift - 1] += session.duration;
    });
    return totals;
};