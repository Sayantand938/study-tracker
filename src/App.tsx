import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TimerProvider } from "@/context/TimerContext";
import { Timer } from "@/components/Timer";
import { History } from "@/pages/History";
import { Dashboard } from "@/pages/Dashboard";
import { Settings } from "@/pages/Settings";
import { Layout } from "@/components/layout/Layout";

export function App() {
  return (
    <BrowserRouter>
      <TimerProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Timer />} />
            <Route path="history" element={<History />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </TimerProvider>
    </BrowserRouter>
  );
}

export default App;