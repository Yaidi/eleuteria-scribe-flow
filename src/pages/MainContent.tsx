import { useEffect, useState } from "react";
import Sidebar from "@/pages/content/Sidebar.tsx";
import MainHeader from "@/pages/content/MainHeader.tsx";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/config.ts";
import { getCurrentId } from "@/store/electron/actions.ts";
import { getProjectFetch } from "@/store/projects/slice.ts";
import NavbarSections from "@/pages/content/NavbarSections.tsx";
import { renderCurrentSection } from "@/pages/sections/SwitchSections.tsx";
import { useTranslation } from "react-i18next";
import { State } from "@/types/project.ts";
import BackButton from "@/components/navbar/BackButton.tsx";

const MainContent = () => {
  const { t } = useTranslation();
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
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
          {t("loading.loading_project")}
        </p>
      </div>
    );
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
            {renderCurrentSection(currentSection)}
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
