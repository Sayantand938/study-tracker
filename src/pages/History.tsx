import { HistoryTable } from "@/components/history/HistoryTable";

export function History() {
    return (
        <div className="flex flex-col space-y-4">
            <h1 className="text-2xl font-medium">History</h1>
            <HistoryTable />
        </div>
    );
}