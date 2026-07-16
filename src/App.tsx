// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TimerProvider, useTimer } from "@/context/TimerContext";
import { Timer } from "@/components/Timer";
import { History } from "@/pages/History";
import { Dashboard } from "@/pages/Dashboard";
import { Settings } from "@/pages/Settings";
import { Layout } from "@/components/layout/Layout";

function AppContent() {
  const { loading } = useTimer();
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
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Timer />} />
        <Route path="history" element={<History />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <TimerProvider>
        <AppContent />
      </TimerProvider>
    </BrowserRouter>
  );
}

export default App;