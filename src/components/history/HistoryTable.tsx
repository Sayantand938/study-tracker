import { formatTime, formatDuration } from "@/lib/timer-utils";
import useTimerStore from "@/store/timerStore";
import type { Session } from "@/types";

export function HistoryTable({ sessions }: { sessions?: Session[] }) {
    const history = useTimerStore((state) => state.history);
    const data = sessions ?? history;

    // Filter out active sessions (endTime === null)
    const completedSessions = data.filter(s => s.endTime !== null);

    if (completedSessions.length === 0) {
        return <p className="py-8 text-center text-sm text-muted-foreground">No completed sessions on this day.</p>;
    }

    const totalDuration = completedSessions.reduce((acc, session) => acc + session.duration, 0);

    return (
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full border-collapse text-sm sm:text-base">
                <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground sm:text-sm">
                        <th className="py-2 pr-2 font-medium sm:py-3 sm:px-4">#</th>
                        <th className="py-2 px-2 font-medium sm:px-4">Start</th>
                        <th className="py-2 px-2 font-medium sm:px-4">End</th>
                        <th className="py-2 pl-2 pr-0 font-medium text-right sm:pr-4 sm:pl-4">Duration</th>
                    </tr>
                </thead>
                <tbody>
                    {completedSessions.map((session, index) => (
                        <tr
                            key={session.id}
                            className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                        >
                            <td className="py-2 pr-2 text-muted-foreground sm:py-3 sm:px-4">
                                {index + 1}
                            </td>
                            <td className="py-2 px-2 text-xs sm:text-sm sm:px-4">
                                {formatTime(session.startTime)}
                            </td>
                            <td className="py-2 px-2 text-xs sm:text-sm sm:px-4">
                                {formatTime(session.endTime!)}
                            </td>
                            <td className="py-2 pl-2 pr-0 text-right font-mono text-xs sm:text-sm sm:pr-4 sm:pl-4">
                                {formatDuration(session.duration)}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="border-t border-border font-medium">
                        <td className="py-2 pr-2 text-muted-foreground sm:py-3 sm:px-4">T</td>
                        <td className="py-2 px-2 text-muted-foreground/50 sm:px-4">–</td>
                        <td className="py-2 px-2 text-muted-foreground/50 sm:px-4">–</td>
                        <td className="py-2 pl-2 pr-0 text-right font-mono text-xs sm:text-sm sm:pr-4 sm:pl-4">
                            {formatDuration(totalDuration)}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}