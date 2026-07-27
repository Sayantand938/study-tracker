import { useShallow } from 'zustand/react/shallow';
import useTimerStore from "@/store/timerStore";
import { Button } from "@/components/ui/button";
import { Play, Square, RotateCcw } from "lucide-react";

export function Timer() {
  const { time, isRunning, startTimer, stopTimer, resetTimer } = useTimerStore(
    useShallow((state) => ({
      time: state.time,
      isRunning: state.isRunning,
      startTimer: state.startTimer,
      stopTimer: state.stopTimer,
      resetTimer: state.resetTimer,
    }))
  );

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
    <div className="h-full w-full flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Timer display – now bold */}
      <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-martian font-bold tracking-wider select-none">
        {formatTime(time)}
      </div>
      <div className="mt-8 flex gap-6">
        <Button
          variant="outline"
          size="lg"
          className="h-14 w-14 rounded-full"
          onClick={handleStartStop}
          aria-label={isRunning ? "Stop timer" : "Start timer"}
        >
          {isRunning ? <Square className="h-7 w-7" /> : <Play className="h-7 w-7" />}
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="h-14 w-14 rounded-full"
          onClick={resetTimer}
          aria-label="Reset timer"
        >
          <RotateCcw className="h-7 w-7" />
        </Button>
      </div>
    </div>
  );
}