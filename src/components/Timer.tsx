import { useTimer } from "@/context/TimerContext";
import { Button } from "@/components/ui/button";
import { Play, Square, RotateCcw, History } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Timer() {
    const { time, isRunning, startTimer, stopTimer, resetTimer } = useTimer();
    const navigate = useNavigate();

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleStartStop = () => {
        if (isRunning) {
            stopTimer();
        } else {
            startTimer();
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
            <div className="text-8xl font-mono font-light tracking-wider select-none">
                {formatTime(time)}
            </div>
            <div className="mt-8 flex gap-4">
                <Button
                    variant="outline"
                    size="lg"
                    className="border-white/40 text-white hover:bg-white/10 hover:text-white"
                    onClick={handleStartStop}
                >
                    {isRunning ? <Square className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
                    {isRunning ? "Stop" : "Start"}
                </Button>
                <Button
                    variant="outline"
                    size="lg"
                    className="border-white/40 text-white hover:bg-white/10 hover:text-white"
                    onClick={resetTimer}
                >
                    <RotateCcw className="mr-2 h-5 w-5" />
                    Reset
                </Button>
                <Button
                    variant="outline"
                    size="lg"
                    className="border-white/40 text-white hover:bg-white/10 hover:text-white"
                    onClick={() => navigate("/history")}
                >
                    <History className="mr-2 h-5 w-5" />
                    History
                </Button>
            </div>
        </div>
    );
}