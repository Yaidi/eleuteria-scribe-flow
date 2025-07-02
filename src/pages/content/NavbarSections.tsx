import { setCurrentSection } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/config.tsx";
import { useSections } from "@/hooks/useSections.ts";
import { ESections } from "@/types/sections.ts";

const getSection = (section: string): ESections => {
  return ESections[section as keyof typeof ESections];
};

const NavbarSections = () => {
  const { currentSection } = useSelector((state: RootState) => state.projectInfo);
  const dispatch = useDispatch<AppDispatch>();
  const sections = useSections();

  return (
    <>
      {Object.keys(sections).map((section) => (
        <button
          key={section}
          onClick={() => dispatch(setCurrentSection(getSection(section)))}
          className={`w-full p-3 rounded-lg text-left transition-colors ${
            currentSection === getSection(section)
              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          }`}
        >
          <span className="capitalize">{section}</span>
        </button>
      ))}
    </>
  );
};
export default NavbarSections;
