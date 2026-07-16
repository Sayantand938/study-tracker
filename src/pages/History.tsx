import { useState, useMemo } from "react";
import { HistoryTable } from "@/components/history/HistoryTable";
import useTimerStore from "@/store/timerStore";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";

const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

export function History() {
    const history = useTimerStore((state) => state.history);
    // Default to today
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // Filter sessions by selected date (always filtered)
    const filteredHistory = useMemo(() => {
        return history.filter((session) => {
            const d = new Date(session.startTime);
            return (
                d.getFullYear() === selectedDate.getFullYear() &&
                d.getMonth() === selectedDate.getMonth() &&
                d.getDate() === selectedDate.getDate()
            );
        });
    }, [history, selectedDate]);

    const goToToday = () => setSelectedDate(new Date());

    return (
        <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-medium">History</h1>
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger>
                            <Button
                                variant="outline"
                                className="w-[180px] justify-start text-left font-normal"
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formatDate(selectedDate)}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => date && setSelectedDate(date)}
                            />
                        </PopoverContent>
                    </Popover>
                    <Button variant="ghost" size="icon" onClick={goToToday} title="Go to today">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            {/* Show a small summary */}
            <p className="text-sm text-muted-foreground">
                Showing {filteredHistory.length} session{filteredHistory.length !== 1 ? "s" : ""} for {formatDate(selectedDate)}
            </p>
            <HistoryTable sessions={filteredHistory} />
        </div>
    );
}