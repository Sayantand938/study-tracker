import useTimerStore from "@/store/timerStore";
import { Button } from "@/components/ui/button";
import { Play, Square, RotateCcw } from "lucide-react";

export function Timer() {
  const { time, isRunning, startTimer, stopTimer, resetTimer } = useTimerStore((state) => ({
    time: state.time,
    isRunning: state.isRunning,
    startTimer: state.startTimer,
    stopTimer: state.stopTimer,
    resetTimer: state.resetTimer,
  }));

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
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center">
      <div className="text-8xl font-sans font-light tracking-wider select-none">
        {formatTime(time)}
      </div>
      <div className="mt-8 flex gap-4">
        <Button variant="outline" size="lg" onClick={handleStartStop}>
          {isRunning ? <Square className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
          {isRunning ? "Stop" : "Start"}
        </Button>
        <Button variant="outline" size="lg" onClick={resetTimer}>
          <RotateCcw className="mr-2 h-5 w-5" />
          Reset
        </Button>
      </div>
    </div>
  );
}