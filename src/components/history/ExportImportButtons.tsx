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
    const { history, setHistory } = useTimer();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Dialog state
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
        // Close confirm dialog first
        setDialogOpen(false);
        // Execute the confirm action after a short delay to allow dialog to close
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

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result;
                if (typeof content !== "string") throw new Error("Invalid file content");
                const imported = JSON.parse(content);
                if (!Array.isArray(imported)) throw new Error("Data must be an array");

                const valid = imported.every(
                    (item) =>
                        item.id &&
                        item.startTime &&
                        item.endTime &&
                        typeof item.duration === "number"
                );
                if (!valid) throw new Error("Invalid session data structure");

                const sessions = imported.map((s: any) => ({
                    ...s,
                    startTime: new Date(s.startTime),
                    endTime: new Date(s.endTime),
                }));

                showConfirm(
                    `This will replace all current history (${history.length} sessions) with ${sessions.length} imported sessions. Continue?`,
                    () => {
                        setHistory(sessions);
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
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={handleExport}
                >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={handleImportClick}
                >
                    <Upload className="mr-2 h-4 w-4" />
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
                <DialogContent className="bg-black text-white border border-white/20 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-white">{dialogTitle}</DialogTitle>
                        <DialogDescription className="text-white/70">
                            {dialogMessage}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        {dialogType === "confirm" ? (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={handleDialogCancel}
                                    className="border-white/20 text-white hover:bg-white/10"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="default"
                                    onClick={handleDialogConfirm}
                                    className="bg-white text-black hover:bg-white/90"
                                >
                                    Confirm
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="default"
                                onClick={handleDialogCancel}
                                className="bg-white text-black hover:bg-white/90"
                            >
                                OK
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}