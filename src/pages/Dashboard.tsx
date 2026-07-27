import { WeeklyOverview } from "@/components/dashboard/WeeklyOverview";
import useTimerStore from "@/store/timerStore";

export function Dashboard() {
    const history = useTimerStore((state) => state.history);
    const today = new Date();

    return (
        <div className="space-y-6">
            <WeeklyOverview history={history} today={today} />
        </div>
    );
}