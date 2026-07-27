import { formatDuration, getOverlapSeconds } from "@/lib/timer-utils";
import { format, startOfDay, endOfDay } from "date-fns";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Session } from "@/types";

interface HourlyBreakdownProps {
    sessions: Session[];       // completed sessions for the selected date
    date: Date;                // the date we're viewing
}

export function HourlyBreakdown({ sessions, date }: HourlyBreakdownProps) {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    // Filter sessions that actually overlap this day (should already be filtered, but safe)
    const daySessions = sessions.filter(
        (s) => s.startTime >= dayStart && s.startTime <= dayEnd
    );

    const hourlySlots: { hour: number; totalSeconds: number }[] = [];
    for (let h = 0; h < 24; h++) {
        const slotStart = new Date(date);
        slotStart.setHours(h, 0, 0, 0);
        const slotEnd = new Date(date);
        slotEnd.setHours(h + 1, 0, 0, 0);
        let totalSec = 0;
        for (const session of daySessions) {
            // session.endTime is not null because we only pass completed sessions
            const end = session.endTime!;
            const overlap = getOverlapSeconds(session.startTime, end, slotStart, slotEnd);
            totalSec += overlap;
        }
        hourlySlots.push({ hour: h, totalSeconds: totalSec });
    }

    const achievedCount = hourlySlots.filter((slot) => slot.totalSeconds >= 1800).length;
    const totalDaySeconds = hourlySlots.reduce((sum, slot) => sum + slot.totalSeconds, 0);
    const isGoalMet = achievedCount >= 16;

    return (
        <div>
            <h3 className="text-lg font-medium mb-2">Hourly Breakdown</h3>
            <p className="text-sm text-muted-foreground mb-3">Each slot is 1 hour. Achieved = ≥30 min.</p>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="border-b border-border text-left text-muted-foreground">
                            <th className="py-2 px-4 font-medium">Hour</th>
                            <th className="py-2 px-4 font-medium text-right">Study Time</th>
                            <th className="py-2 px-4 font-medium text-center">Achieved?</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hourlySlots.map((slot) => {
                            const achieved = slot.totalSeconds >= 1800;
                            return (
                                <tr key={slot.hour} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                                    <td className="py-2 px-4">
                                        {format(new Date(date).setHours(slot.hour, 0, 0, 0), "HH:00")}
                                        {" – "}
                                        {format(new Date(date).setHours(slot.hour + 1, 0, 0, 0), "HH:00")}
                                    </td>
                                    <td className="py-2 px-4 text-right font-mono">{formatDuration(slot.totalSeconds)}</td>
                                    <td className="py-2 px-4 text-center">
                                        {achieved ? (
                                            <CheckCircle2 className="inline h-5 w-5 text-green-600 dark:text-green-400" />
                                        ) : (
                                            <XCircle className="inline h-5 w-5 text-muted-foreground" />
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr className="border-t border-border font-medium">
                            <td className="py-2 px-4">Total</td>
                            <td className="py-2 px-4 text-right font-mono">{formatDuration(totalDaySeconds)}</td>
                            <td className={cn(
                                "py-2 px-4 text-center font-mono",
                                isGoalMet ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                            )}>
                                {achievedCount} / 24
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}