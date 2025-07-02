import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Moon, Settings, Sun } from "lucide-react";
import General from "@/pages/sections/General.tsx";
import Characters from "@/pages/sections/Characters.tsx";
import Plot from "@/pages/sections/Plot.tsx";
import World from "@/pages/sections/World.tsx";
import Manuscript from "@/pages/sections/Manuscript.tsx";
import { ESections } from "@/types/sections.ts";
import Sidebar from "@/pages/content/Sidebar.tsx";
import MainHeader from "@/components/MainHeader.tsx";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/config.tsx";
import { getCurrentId } from "@/store/electron/actions.ts";
import { getProjectFetch } from "@/store/projects/slice.ts";
import NavbarSections from "@/pages/content/NavbarSections.tsx";

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

  const renderCurrentSection = () => {
    switch (currentSection) {
      case ESections.general:
        return <General />;
      case ESections.characters:
        return <Characters />;
      case ESections.plots:
        return <Plot />;
      case ESections.world:
        return <World />;
      default:
        return <Manuscript section={currentSection} />;
    }
  };

  if (currentProject != undefined)
    return (
      <div className={`min-h-screen flex ${darkMode ? "dark" : ""}`}>
        <div className="">
          <header className="w-full flex items-center justify-start p-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-lg m-2 font-semibold text-slate-800 dark:text-slate-200">
              {currentProject?.projectName ?? "Project"}
            </h2>
            <Button variant="ghost" size="sm" onClick={toggleDarkMode}>
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </header>
          <section className="flex h-full">
            <nav className="min-w-40 max-w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 p-4">
              <section className="flex flex-col space-y-2 mb-6">
                <NavbarSections></NavbarSections>
              </section>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </nav>
            <Sidebar activeSection={currentSection}></Sidebar>
          </section>
        </div>
        <main className="flex flex-col bg-white dark:bg-slate-800 p-8 overflow-auto w-full">
          <MainHeader currentProject={currentProject} currentSection={currentSection}></MainHeader>
          {renderCurrentSection()}
        </main>
      </div>
    );
};

export default MainContent;
