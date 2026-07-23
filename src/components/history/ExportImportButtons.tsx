import { useShallow } from 'zustand/react/shallow';
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner"; // <-- import toast
import useTimerStore from "@/store/timerStore";
import type { Session } from "@/types";
import { useRef, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

// Type for a session as stored in JSON (dates as strings, endTime can be null)
type ImportedSession = Omit<Session, 'startTime' | 'endTime'> & {
    startTime: string;
    endTime: string | null;
};

// Type guard that accepts endTime: null or a valid date string
function isValidSession(item: unknown): item is ImportedSession {
    if (!item || typeof item !== 'object') return false;
    const s = item as Record<string, unknown>;
    if (!s.id || !s.startTime || typeof s.duration !== 'number') return false;
    if (typeof s.startTime !== 'string') return false;
    const start = new Date(s.startTime as string);
    if (isNaN(start.getTime())) return false;

    // endTime can be null (active) or a valid date string
    if (s.endTime !== null && typeof s.endTime !== 'string') return false;
    if (s.endTime !== null) {
        const end = new Date(s.endTime as string);
        if (isNaN(end.getTime())) return false;
        if (end.getTime() < start.getTime()) return false;
    } else {
        if (s.duration !== 0) return false;
    }
    return true;
}

export function ExportImportButtons() {
    const { history, replaceHistory } = useTimerStore(
        useShallow((state) => ({
            history: state.history,
            replaceHistory: state.replaceHistory,
        }))
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMessage, setDialogMessage] = useState("");
    const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);

    const showConfirm = (message: string, onConfirmAction: () => void) => {
        setDialogMessage(message);
        setOnConfirm(() => onConfirmAction);
        setDialogOpen(true);
    };

    const handleDialogConfirm = () => {
        setDialogOpen(false);
        if (onConfirm) {
            setTimeout(() => {
                onConfirm();
            }, 100);
        }
    };

    const handleDialogCancel = () => {
        setDialogOpen(false);
    };

    const handleExport = () => {
        try {
            const data = JSON.stringify(history, null, 2);
            const blob = new Blob([data], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;

            const now = new Date();
            const datePart = now.toISOString().slice(0, 10);
            const timePart = now.toTimeString().slice(0, 8).replace(/:/g, "-");
            link.download = `study-history-${datePart}-${timePart}.json`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success(`Exported ${history.length} sessions successfully`);
        } catch (error) {
            toast.error('Export failed', {
                description: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const content = e.target?.result;
                if (typeof content !== "string") throw new Error("Invalid file content");
                const imported = JSON.parse(content);
                if (!Array.isArray(imported)) throw new Error("Data must be an array");

                const valid = imported.every((item) => isValidSession(item));
                if (!valid) throw new Error("Invalid session data structure");

                const sessions = (imported as ImportedSession[]).map((s) => ({
                    ...s,
                    startTime: new Date(s.startTime),
                    endTime: s.endTime ? new Date(s.endTime) : null,
                })) as Session[];

                showConfirm(
                    `This will replace all current history (${history.length} sessions) with ${sessions.length} imported sessions. Continue?`,
                    async () => {
                        try {
                            await replaceHistory(sessions);
                            toast.success(`Successfully imported ${sessions.length} sessions`);
                        } catch (err) {
                            toast.error('Import failed', {
                                description: err instanceof Error ? err.message : 'Unknown error',
                            });
                        }
                    }
                );
            } catch (error) {
                toast.error('Import failed', {
                    description: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        };
        reader.readAsText(file);
        event.target.value = "";
    };

    return (
        <>
            <div className="flex flex-wrap gap-2 sm:gap-1">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-none min-w-[80px]"
                    onClick={handleExport}
                >
                    <Download className="mr-1 h-4 w-4" />
                    Export
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-none min-w-[80px]"
                    onClick={handleImportClick}
                >
                    <Upload className="mr-1 h-4 w-4" />
                    Import
                </Button>
                <input
                    type="file"
                    accept=".json"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>

            {/* Keep the confirm dialog for important actions */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirm Import</DialogTitle>
                        <DialogDescription>{dialogMessage}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={handleDialogCancel}>
                            Cancel
                        </Button>
                        <Button variant="default" onClick={handleDialogConfirm}>
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}