import { ShiftWidgets } from "@/components/history/ShiftWidgets";
import useTimerStore from "@/store/timerStore";
import { formatDuration } from "@/lib/timer-utils";
import {
    isSameDay,
    startOfWeek,
    eachDayOfInterval,
    format,
} from "date-fns";

export function Dashboard() {
    const history = useTimerStore((state) => state.history);
    const today = new Date();

    // Today's sessions
    const todaySessions = history.filter((session) =>
        isSameDay(session.startTime, today)
    );
    const todayTotal = todaySessions.reduce((sum, s) => sum + s.duration, 0);

    // Week: Monday to Sunday
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const weekTotals = weekDays.map((day) => {
        const dayTotal = history
            .filter((session) => isSameDay(session.startTime, day))
            .reduce((sum, s) => sum + s.duration, 0);
        return { day, total: dayTotal };
    });

    const weekTotal = weekTotals.reduce((sum, item) => sum + item.total, 0);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-medium">Dashboard</h2>
                <p className="text-muted-foreground">
                    Today's study time:{" "}
                    <span className="font-mono font-medium text-foreground">
                        {formatDuration(todayTotal)}
                    </span>
                </p>
            </div>

            <ShiftWidgets sessions={todaySessions} />

            <div>
                <h3 className="text-lg font-medium mb-2">This Week</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Total: <span className="font-mono">{formatDuration(weekTotal)}</span>
                </p>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-border text-left text-sm text-muted-foreground">
                                <th className="py-2 px-4 font-medium">Day</th>
                                <th className="py-2 px-4 font-medium text-right">Study Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {weekTotals.map((item, index) => {
                                const isToday = isSameDay(item.day, today);
                                return (
                                    <tr
                                        key={index}
                                        className={`border-b border-border/50 hover:bg-muted/50 transition-colors ${isToday ? "bg-primary/5" : ""
                                            }`}
                                    >
                                        <td className="py-3 px-4">
                                            <span className={isToday ? "font-medium" : ""}>
                                                {format(item.day, "EEE")}
                                            </span>
                                            <span className="text-muted-foreground text-sm ml-2">
                                                {format(item.day, "MMM d")}
                                            </span>
                                            {isToday && (
                                                <span className="ml-2 text-xs text-primary font-medium">
                                                    Today
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono">
                                            {formatDuration(item.total)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}