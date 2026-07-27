import { useShallow } from 'zustand/react/shallow';
import { useTheme } from "@/components/theme-provider";
import useTimerStore from "@/store/timerStore";
import { Button } from "@/components/ui/button";
import { ExportImportButtons } from "@/components/history/ExportImportButtons";
import { Moon, Sun, Trash2 } from "lucide-react";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export function Settings() {
    const { theme, setTheme } = useTheme();
    const { history, clearHistory } = useTimerStore(
        useShallow((state) => ({
            history: state.history,
            clearHistory: state.clearHistory,
        }))
    );
    const [clearDialogOpen, setClearDialogOpen] = useState(false);

    const handleClearHistory = async () => {
        await clearHistory();
        setClearDialogOpen(false);
    };

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <div className="space-y-4">
            {/* Theme */}
            <div className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="font-medium">Theme</p>
                    <p className="text-sm text-muted-foreground">
                        Switch between light and dark mode
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={toggleTheme} className="w-full sm:w-auto">
                    {theme === "dark" ? (
                        <>
                            <Sun className="mr-2 h-4 w-4" />
                            Light
                        </>
                    ) : (
                        <>
                            <Moon className="mr-2 h-4 w-4" />
                            Dark
                        </>
                    )}
                </Button>
            </div>

            {/* Data */}
            <div className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="font-medium">Data</p>
                    <p className="text-sm text-muted-foreground">
                        Export or import your study history
                    </p>
                </div>
                <ExportImportButtons />
            </div>

            {/* Clear History */}
            <div className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="font-medium">Clear History</p>
                    <p className="text-sm text-muted-foreground">
                        Permanently delete all sessions ({history.length} sessions)
                    </p>
                </div>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setClearDialogOpen(true)}
                    disabled={history.length === 0}
                    className="w-full sm:w-auto"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear
                </Button>
            </div>

            <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Clear all history?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. All {history.length} sessions will be permanently deleted.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setClearDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleClearHistory}>
                            Clear All
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}