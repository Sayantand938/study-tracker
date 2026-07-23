export type Session = {
    id: string;
    startTime: Date;
    endTime: Date | null;   // null = still active
    duration: number;       // 0 while active, final seconds on stop
};