// src/pages/Settings.tsx
import { useTheme } from "@/components/theme-provider";
import { useTimer } from "@/context/TimerContext";
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
    const { history, clearHistory } = useTimer();
    const [clearDialogOpen, setClearDialogOpen] = useState(false);

    const handleClearHistory = async () => {
        await clearHistory();
        setClearDialogOpen(false);
    };

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-medium">Settings</h2>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                    <p className="font-medium">Theme</p>
                    <p className="text-sm text-muted-foreground">
                        Switch between light and dark mode
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={toggleTheme}>
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

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                    <p className="font-medium">Data</p>
                    <p className="text-sm text-muted-foreground">
                        Export or import your study history
                    </p>
                </div>
                <ExportImportButtons />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
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