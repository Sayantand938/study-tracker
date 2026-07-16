import { ShiftWidgets } from "@/components/history/ShiftWidgets";
import { useTimer } from "@/context/TimerContext";
import { formatDuration } from "@/lib/timer-utils";

export function Dashboard() {
    const { history } = useTimer();
    const totalSeconds = history.reduce((acc, s) => acc + s.duration, 0);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-medium">Dashboard</h2>
                <p className="text-muted-foreground">
                    Total study time: <span className="font-mono font-medium text-foreground">{formatDuration(totalSeconds)}</span>
                </p>
            </div>
            <ShiftWidgets />
        </div>
    );
}