// src/components/history/HistoryTable.tsx
import { formatTime, formatDuration } from "@/lib/timer-utils";
import useTimerStore from "@/store/timerStore";
import type { Session } from "@/types";

export function HistoryTable({ sessions }: { sessions?: Session[] }) {
    const history = useTimerStore((state) => state.history);
    const data = sessions ?? history; // use prop if provided, else store

    if (data.length === 0) {
        return <p className="text-muted-foreground">No sessions recorded yet.</p>;
    }

    const totalDuration = data.reduce((acc, session) => acc + session.duration, 0);

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b border-border text-left text-sm text-muted-foreground">
                        <th className="py-2 px-4 font-medium">#</th>
                        <th className="py-2 px-4 font-medium">Start</th>
                        <th className="py-2 px-4 font-medium">End</th>
                        <th className="py-2 px-4 font-medium text-right">Duration</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((session, index) => (
                        <tr
                            key={session.id}
                            className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                        >
                            <td className="py-3 px-4 text-muted-foreground">{index + 1}</td>
                            <td className="py-3 px-4">{formatTime(session.startTime)}</td>
                            <td className="py-3 px-4">{formatTime(session.endTime)}</td>
                            <td className="py-3 px-4 text-right font-mono">
                                {formatDuration(session.duration)}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="border-t border-border font-medium">
                        <td className="py-3 px-4 text-muted-foreground">T</td>
                        <td className="py-3 px-4 text-muted-foreground/50">–</td>
                        <td className="py-3 px-4 text-muted-foreground/50">–</td>
                        <td className="py-3 px-4 text-right font-mono text-foreground">
                            {formatDuration(totalDuration)}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}