import { useState, useMemo } from "react";
import { HistoryTable } from "@/components/history/HistoryTable";
import useTimerStore from "@/store/timerStore";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, isSameDay } from "date-fns";

export function History() {
    const history = useTimerStore((state) => state.history);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const filteredHistory = useMemo(() => {
        return history.filter((session) =>
            session.endTime !== null && isSameDay(session.startTime, selectedDate)
        );
    }, [history, selectedDate]);

    return (
        <div className="flex flex-col space-y-3">
            <div className="flex w-full items-center justify-center gap-2">
                <span className="text-sm font-medium sm:text-base">
                    Sessions from {format(selectedDate, "MMM d, yyyy")}
                </span>

                <Popover>
                    <PopoverTrigger>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9"
                            aria-label="Pick a date"
                        >
                            <CalendarIcon className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <HistoryTable sessions={filteredHistory} />
        </div>
    );
}