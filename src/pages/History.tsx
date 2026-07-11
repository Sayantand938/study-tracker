import { useTimer } from "@/context/TimerContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function History() {
    const { history } = useTimer();
    const navigate = useNavigate();

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
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
                                        <td className="py-3 px-4 text-right font-sans">
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