import { formatDuration, calculateShiftTotals } from "@/lib/timer-utils";
import { useTimer } from "@/context/TimerContext";

const shiftLabels = ["Shift 1", "Shift 2", "Shift 3", "Shift 4"];
const shiftRanges = ["00:00–12:00", "12:00–16:00", "16:00–20:00", "20:00–24:00"];

export function ShiftWidgets() {
    const { history } = useTimer();
    const totals = calculateShiftTotals(history);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {totals.map((total, index) => (
                <div
                    key={index}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 text-center"
                >
                    <div className="text-sm text-white/60">{shiftLabels[index]}</div>
                    <div className="text-xs text-white/40">{shiftRanges[index]}</div>
                    <div className="text-2xl font-mono mt-2">
                        {formatDuration(total)}
                    </div>
                </div>
            ))}
        </div>
    );
}