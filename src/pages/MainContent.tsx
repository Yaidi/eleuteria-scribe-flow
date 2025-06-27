import {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import { Moon, Sun} from 'lucide-react';
import General from "@/pages/sections/General.tsx";
import Characters from "@/pages/sections/Characters.tsx";
import Plot from "@/pages/sections/Plot.tsx";
import World from "@/pages/sections/World.tsx";
import Manuscript from "@/pages/sections/Manuscript.tsx";
import {ESections} from "@/types/sections.tsx";
import Sidebar from "@/pages/Sidebar.tsx";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/store/config.tsx";
import MainHeader from "@/components/MainHeader.tsx";
import { setCurrentSection} from "@/store/project/actions.ts";

const MainContent = () => {
  const location = useLocation();
  const { currentProject, currentSection } = useSelector((state: RootState) => state.projectInfo);
  const [darkMode, setDarkMode] = useState(false);
  const dispatch = useDispatch()

  useEffect(() => {
  }, [dispatch])

  const template = location.state?.template || 'novel';

  const getSections = () => {
    switch (template) {
      case 'novel':
        return [ESections.General, ESections.Characters, ESections.World, ESections.Plots,ESections.Manuscript, ESections.Resources];
      case 'story':
        return [ESections.General, ESections.Characters, ESections.World,ESections.Manuscript, ESections.Resources];
      case 'thesis':
        return [ESections.General,ESections.Manuscript, ESections.References, ESections.Bibliography, ESections.Resources];
      case 'poems':
        return [ESections.General,ESections.Manuscript, ESections.References];
      case 'illustrated':
        return [ESections.Any, ESections.General,ESections.Manuscript, ESections.Illustrations, ESections.Resources];
      default:
        return [ESections.General,ESections.Manuscript, ESections.Resources];
    }
  };

  const sections = getSections();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const renderCurrentSection = () => {
    switch (currentSection) {
      case ESections.General:
        return <General />;
      case ESections.Characters:
        return <Characters />;
      case ESections.Plots:
        return <Plot />;
      case ESections.World:
        return <World />;
      default:
        return <Manuscript section={currentSection} />;
    }
  };

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark' : ''}`}>
      <div className="">
        <header className="w-full flex items-center justify-start p-6">
          <h2 className="text-lg m-2 font-semibold text-slate-800 dark:text-slate-200">Project</h2>
          <Button variant="ghost" size="sm" onClick={toggleDarkMode}>
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </header>
        <section className="flex h-full">
          <nav className="w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 p-4">
            <section className="space-y-2 mb-6">
              {sections.map((section) => (
                  <button
                      key={section}
                      onClick={() => dispatch(setCurrentSection(section))}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                          currentSection === section
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                  >
                    <span className="capitalize">{section}</span>
                  </button>
              ))}
            </section>
          </nav>
            <Sidebar activeSection={currentSection}></Sidebar>
        </section>
      </div>
      <main className="flex bg-white dark:bg-slate-800 p-8 overflow-auto">
        {
          currentProject != undefined && (
                <MainHeader currentProject={currentProject} currentSection={currentSection} ></MainHeader>
            )
        }
        {renderCurrentSection()}
      </main>
    </div>
  );
};

export default MainContent;
