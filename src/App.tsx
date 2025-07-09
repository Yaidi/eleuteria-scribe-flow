import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, HashRouter, BrowserRouter } from "react-router-dom";
import Welcome from "./pages/welcome/Welcome.tsx";
import MainContent from "./pages/MainContent";
import NotFound from "./pages/NotFound";
import { electron } from "@/store/electron/actions.ts";

const queryClient = new QueryClient();

const App = () => {
  const Router = electron ? HashRouter : BrowserRouter;
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/main" element={<MainContent />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
