import { formatDuration } from "@/lib/timer-utils";
import { isSameDay } from "date-fns";

interface TodaySummaryProps {
    todayTotal: number;
    activeSession: { startTime: Date } | null;
    today: Date;
}

export function TodaySummary({ todayTotal, activeSession, today }: TodaySummaryProps) {
    return (
        <div>
            <h3 className="text-lg font-medium">Today's Shifts</h3>
            <p className="text-sm text-muted-foreground">
                Total study time:{" "}
                <span className="font-mono font-medium text-foreground">
                    {formatDuration(todayTotal)}
                </span>
                {activeSession && isSameDay(activeSession.startTime, today) && (
                    <span className="ml-2 text-xs text-primary">(includes current session)</span>
                )}
            </p>
        </div>
    );
}