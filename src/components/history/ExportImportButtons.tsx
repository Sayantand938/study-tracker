// src/components/history/ExportImportButtons.tsx
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { useTimer } from "@/context/TimerContext";
import { useRef, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export function ExportImportButtons() {
    const { history, replaceHistory } = useTimer();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState<"confirm" | "alert">("confirm");
    const [dialogTitle, setDialogTitle] = useState("");
    const [dialogMessage, setDialogMessage] = useState("");
    const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);

    const showConfirm = (message: string, onConfirmAction: () => void) => {
        setDialogType("confirm");
        setDialogTitle("Confirm");
        setDialogMessage(message);
        setOnConfirm(() => onConfirmAction);
        setDialogOpen(true);
    };

    const showAlert = (message: string) => {
        setDialogType("alert");
        setDialogTitle("Notice");
        setDialogMessage(message);
        setOnConfirm(null);
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

                const valid = imported.every((item: any) => {
                    if (!item.id || !item.startTime || !item.endTime || typeof item.duration !== "number")
                        return false;
                    const start = new Date(item.startTime);
                    const end = new Date(item.endTime);
                    if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
                    if (end.getTime() < start.getTime()) return false;
                    return true;
                });
                if (!valid) throw new Error("Invalid session data structure");

                const sessions = imported.map((s: any) => ({
                    ...s,
                    startTime: new Date(s.startTime),
                    endTime: new Date(s.endTime),
                }));

                showConfirm(
                    `This will replace all current history (${history.length} sessions) with ${sessions.length} imported sessions. Continue?`,
                    async () => {
                        await replaceHistory(sessions);
                        showAlert(`Successfully imported ${sessions.length} sessions.`);
                    }
                );
            } catch (error) {
                showAlert(`Import failed: ${error instanceof Error ? error.message : "Unknown error"}`);
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

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{dialogTitle}</DialogTitle>
                        <DialogDescription>
                            {dialogMessage}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        {dialogType === "confirm" ? (
                            <>
                                <Button variant="outline" onClick={handleDialogCancel}>
                                    Cancel
                                </Button>
                                <Button variant="default" onClick={handleDialogConfirm}>
                                    Confirm
                                </Button>
                            </>
                        ) : (
                            <Button variant="default" onClick={handleDialogCancel}>
                                OK
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}