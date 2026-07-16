// src/pages/Dashboard.tsx
import { ShiftWidgets } from "@/components/history/ShiftWidgets";
import { useTimer } from "@/context/TimerContext";
import { formatDuration } from "@/lib/timer-utils";

// Helper: check if two dates fall on the same calendar day
const isSameDay = (date1: Date, date2: Date) => {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
};

// Helper: get the Monday of the week containing the given date
const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sunday, 1 = Monday...
    const diff = (day === 0 ? 6 : day - 1); // days to subtract to get Monday
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

// Helper: get an array of 7 dates (Monday to Sunday) for the week of the given date
const getWeekDays = (date: Date) => {
    const start = getWeekStart(date);
    const days = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        days.push(d);
    }
    return days;
};

// Helper: format a day name (e.g., "Mon", "Tue")
const formatDayName = (date: Date) => {
    return date.toLocaleDateString(undefined, { weekday: "short" });
};

// Helper: format a date as "MMM D" (e.g., "Feb 15")
const formatDateShort = (date: Date) => {
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export function Dashboard() {
    const { history } = useTimer();

    const today = new Date();

    // 1. Today's sessions
    const todaySessions = history.filter((session) =>
        isSameDay(session.startTime, today)
    );
    const todayTotal = todaySessions.reduce((sum, s) => sum + s.duration, 0);

    // 2. Weekly totals
    const weekDays = getWeekDays(today);
    const weekTotals = weekDays.map((day) => {
        const dayTotal = history
            .filter((session) => isSameDay(session.startTime, day))
            .reduce((sum, s) => sum + s.duration, 0);
        return { day, total: dayTotal };
    });

    const weekTotal = weekTotals.reduce((sum, item) => sum + item.total, 0);

    return (
        <div className="space-y-6">
            {/* Today's summary */}
            <div>
                <h2 className="text-2xl font-medium">Dashboard</h2>
                <p className="text-muted-foreground">
                    Today's study time:{" "}
                    <span className="font-mono font-medium text-foreground">
                        {formatDuration(todayTotal)}
                    </span>
                </p>
            </div>

            {/* Shift widgets for today */}
            <ShiftWidgets sessions={todaySessions} />

            {/* Weekly table */}
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
                                                {formatDayName(item.day)}
                                            </span>
                                            <span className="text-muted-foreground text-sm ml-2">
                                                {formatDateShort(item.day)}
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