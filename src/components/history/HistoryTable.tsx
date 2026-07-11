import { formatTime, formatDuration } from "@/lib/timer-utils";
import { useTimer } from "@/context/TimerContext";

export function HistoryTable() {
    const { history } = useTimer();

    if (history.length === 0) {
        return <p className="text-white/60">No sessions recorded yet.</p>;
    }

    const totalDuration = history.reduce((acc, session) => acc + session.duration, 0);

    return (
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
                        <tr
                            key={session.id}
                            className="border-b border-white/10 hover:bg-white/5 transition-colors"
                        >
                            <td className="py-3 px-4 text-white/70">{index + 1}</td>
                            <td className="py-3 px-4">{formatTime(session.startTime)}</td>
                            <td className="py-3 px-4">{formatTime(session.endTime)}</td>
                            <td className="py-3 px-4 text-right font-mono">
                                {formatDuration(session.duration)}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="border-t border-white/30 font-medium">
                        <td className="py-3 px-4 text-white/80">T</td>
                        <td className="py-3 px-4 text-white/50">–</td>
                        <td className="py-3 px-4 text-white/50">–</td>
                        <td className="py-3 px-4 text-right font-mono text-white">
                            {formatDuration(totalDuration)}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}