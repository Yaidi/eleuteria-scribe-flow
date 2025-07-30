import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import Sidebar from "@/pages/content/Sidebar.tsx";
import MainHeader from "@/pages/content/MainHeader.tsx";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/config.ts";
import { getCurrentId } from "@/store/electron/actions.ts";
import { getProjectFetch } from "@/store/projects/slice.ts";
import NavbarSections from "@/pages/content/NavbarSections.tsx";
import { renderCurrentSection } from "@/pages/sections/SwitchSections.tsx";

const MainContent = () => {
  const { currentProject, currentSection } = useSelector((state: RootState) => state.projectInfo);
  const [darkMode, setDarkMode] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    void getCurrentId().then((id: number) => {
      if (!currentProject) {
        void dispatch(getProjectFetch(id));
      }
    });
  }, [currentProject, dispatch]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  if (currentProject != undefined)
    return (
      <div className={`h-screen flex ${darkMode ? "dark" : ""}`}>
        {/* Columna izquierda */}
        <div className="flex flex-col h-full">
          <header className="w-full flex items-center justify-start px-6 pb-8 pt-8">
            <Button
              data-testid="btn-back"
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-lg m-2 font-semibold text-slate-800 dark:text-slate-200">
              Eleuteria
            </h2>
            <Button data-testid="btn-dark-mode" variant="ghost" size="sm" onClick={toggleDarkMode}>
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </header>
          <section className="flex flex-1 w-full overflow-hidden">
            <nav className="min-w-40 max-w-64 bg-slate-50 dark:bg-slate-900 border-r border-t border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-4 overflow-auto">
              <NavbarSections />
            </nav>

            {/* Sidebar */}
            <Sidebar activeSection={currentSection} />
          </section>
        </div>

        {/* Contenido principal */}
        <main className="flex flex-col bg-white dark:bg-slate-800 p-8 overflow-auto w-full">
          <MainHeader currentProject={currentProject} />
          {renderCurrentSection(currentSection)}
        </main>
      </div>
    );
};

export default MainContent;
