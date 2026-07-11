import { useTimer } from "@/context/TimerContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function History() {
    const { history } = useTimer();
    const navigate = useNavigate();

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const formatDuration = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hrs > 0) {
            return `${hrs}h ${mins}m ${secs}s`;
        } else if (mins > 0) {
            return `${mins}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    };

    const getShift = (date: Date): number => {
        const hours = date.getHours();
        if (hours >= 0 && hours < 12) return 1;
        if (hours >= 12 && hours < 16) return 2;
        if (hours >= 16 && hours < 20) return 3;
        return 4;
    };

    const shiftTotals = [0, 0, 0, 0];
    history.forEach((session) => {
        const shift = getShift(session.startTime);
        shiftTotals[shift - 1] += session.duration;
    });

    const shiftLabels = ["Shift 1", "Shift 2", "Shift 3", "Shift 4"];
    const shiftRanges = ["00:00–12:00", "12:00–16:00", "16:00–20:00", "20:00–24:00"];

    return (
        <div className="flex min-h-screen flex-col bg-black text-white p-6">
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                    onClick={() => navigate("/")}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-medium">Session History</h1>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {shiftTotals.map((total, index) => (
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

            <div className="flex-1 overflow-auto">
                {history.length === 0 ? (
                    <p className="text-white/60">No sessions recorded yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-white/20 text-left text-sm text-white/60">
                                    <th className="py-2 px-4 font-medium">#</th>
                                    <th className="py-2 px-4 font-medium">Start</th>
                                    <th className="py-2 px-4 font-medium">End</th>
                                    <th className="py-2 px-4 font-medium text-right">Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((session, index) => (
                                    <tr key={session.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-4 text-white/70">{index + 1}</td>
                                        <td className="py-3 px-4">{formatTime(session.startTime)}</td>
                                        <td className="py-3 px-4">{formatTime(session.endTime)}</td>
                                        <td className="py-3 px-4 text-right font-mono">
                                            {formatDuration(session.duration)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}