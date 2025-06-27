
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome";
import MainContent from "./pages/MainContent";
import NotFound from "./pages/NotFound";
import {useEffect} from "react";
import {getProjects} from "@/store/Projects/actions.ts";
import {IProjectsReducer} from "@/store/Projects/reducer.ts";
import {connect} from "react-redux";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    getProjects()
  }, [])

  return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/main" element={<MainContent />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
  );
}

function mapStateToProps(state: IProjectsReducer): IProjectsReducer {
  return {
    projects: state.projects
  }
}

export default connect(mapStateToProps, {getProjects})(App);
