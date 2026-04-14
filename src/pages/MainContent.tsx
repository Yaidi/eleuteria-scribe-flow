import { useEffect, useState } from "react";
import Sidebar from "@/pages/content/Sidebar.tsx";
import MainHeader from "@/pages/content/MainHeader.tsx";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/config.ts";
import { getCurrentId } from "@/store/electron/actions.ts";
import { getProjectFetch } from "@/store/projects/slice.ts";
import NavbarSections from "@/pages/content/NavbarSections.tsx";
import { renderCurrentSection } from "@/pages/sections/SwitchSections.tsx";
import { State } from "@/types/project.ts";
import BackButton from "@/components/navbar/BackButton.tsx";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import LoadingProject from "@/pages/LoadingProject.tsx";

const MainContent = () => {
  const { currentProject, currentSection, status } = useSelector(
    (state: RootState) => state.project,
  );
  const [darkMode, setDarkMode] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

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

  if (status == State.LOADING) {
    return <LoadingProject />;
  }

  if (currentProject != undefined && status == State.SUCCESS)
    return (
      <section className={`h-screen flex flex-row-reverse w-full ${darkMode ? "dark" : ""}`}>
        <article className="w-full overflow-hidden">
          <MainHeader
            currentProject={currentProject}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
          />
          <main className="flex flex-col bg-white dark:bg-slate-800 py-8 px-4 overflow-hidden w-full h-full">
            <ScrollArea className="flex-1 overflow-y-auto">
              {renderCurrentSection(currentSection)}
            </ScrollArea>
          </main>
        </article>
        <nav className="min-w-96 h-screen border-r border-slate-200 dark:border-slate-700 gap-4å overflow-hidden">
          <BackButton darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          <div className="flex h-full border-t-2 bg-slate-50 dark:bg-slate-900">
            <NavbarSections />
            <Sidebar activeSection={currentSection} />
          </div>
        </nav>
      </section>
    );
};

export default MainContent;
