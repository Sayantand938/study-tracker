import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner"; // <-- import Toaster
import useTimerStore from "@/store/timerStore";
import { Timer } from "@/components/Timer";
import { History } from "@/pages/History";
import { Dashboard } from "@/pages/Dashboard";
import { Settings } from "@/pages/Settings";
import { Layout } from "@/components/layout/Layout";

function AppContent() {
  const loading = useTimerStore((state) => state.loading);
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your study data...</p>
        </div>
      </div>
    );
  }
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Timer />} />
          <Route path="history" element={<History />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        toastOptions={{
          duration: 4000,
          className: "font-sans",
        }}
      />
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;