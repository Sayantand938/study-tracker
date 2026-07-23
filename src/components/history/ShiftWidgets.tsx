import { formatDuration, calculateShiftTotals } from "@/lib/timer-utils";
import useTimerStore from "@/store/timerStore";
import type { Session } from "@/types";

const shiftLabels = ["Shift 1", "Shift 2", "Shift 3", "Shift 4"];
const shiftRanges = ["00:00–12:00", "12:00–16:00", "16:00–20:00", "20:00–24:00"];

export function ShiftWidgets({ sessions }: { sessions?: Session[] }) {
    const history = useTimerStore((state) => state.history);
    const data = sessions ?? history;
    // Filter out active sessions before calculating totals
    const completed = data.filter(s => s.endTime !== null);
    const totals = calculateShiftTotals(completed);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {totals.map((total, index) => (
                <div
                    key={index}
                    className="bg-muted/30 border border-border rounded-lg p-4 text-center"
                >
                    <div className="text-sm text-muted-foreground">{shiftLabels[index]}</div>
                    <div className="text-xs text-muted-foreground/60">{shiftRanges[index]}</div>
                    <div className="text-2xl font-mono mt-2">
                        {formatDuration(total)}
                    </div>
                </div>
            ))}
        </div>
    );
}