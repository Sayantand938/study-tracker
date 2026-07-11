import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TimerProvider } from "@/context/TimerContext";
import { Timer } from "@/components/Timer";
import { History } from "@/pages/History";

export function App() {
  return (
    <BrowserRouter>
      <TimerProvider>
        <Routes>
          <Route path="/" element={<Timer />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </TimerProvider>
    </BrowserRouter>
  );
}

export default App;