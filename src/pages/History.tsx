import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ShiftWidgets } from "@/components/history/ShiftWidgets";
import { HistoryTable } from "@/components/history/HistoryTable";
import { ExportImportButtons } from "@/components/history/ExportImportButtons";

export function History() {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen flex-col bg-black text-white p-6">
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                    onClick={() => navigate("/")}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-medium">Session History</h1>
                <div className="ml-auto">
                    <ExportImportButtons />
                </div>
            </div>

            <ShiftWidgets />

            <div className="flex-1 overflow-auto">
                <HistoryTable />
            </div>
        </div>
    );
}