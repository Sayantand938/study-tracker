import { ShiftWidgets } from "@/components/history/ShiftWidgets";
import { TodaySummary } from "@/components/dashboard/TodaySummary";
import { HourlyBreakdown } from "@/components/dashboard/HourlyBreakdown";
import { WeeklyOverview } from "@/components/dashboard/WeeklyOverview";
import useTimerStore from "@/store/timerStore";
import { isSameDay } from "date-fns";

export function Dashboard() {
    const history = useTimerStore((state) => state.history);
    const activeSession = useTimerStore((state) => state.activeSession);
    const currentTime = useTimerStore((state) => state.time);
    const today = new Date();

    const completedToday = history.filter(
        (session) => session.endTime !== null && isSameDay(session.startTime, today)
    );
    const completedTodayTotal = completedToday.reduce((sum, s) => sum + s.duration, 0);

    let todayTotal = completedTodayTotal;
    if (activeSession && isSameDay(activeSession.startTime, today)) {
        todayTotal = completedTodayTotal + currentTime;
    }

    return (
        <div className="space-y-6">
            <TodaySummary todayTotal={todayTotal} activeSession={activeSession} today={today} />
            <ShiftWidgets sessions={completedToday} />
            <HourlyBreakdown sessions={history} activeSession={activeSession} today={today} />
            <WeeklyOverview history={history} today={today} />
        </div>
    );
}