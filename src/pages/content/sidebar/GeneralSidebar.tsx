import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";
import { setCurrentGeneral } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/config.ts";
import { GeneralSections } from "@/types/sections.ts";
import { BookOpen, ChartNoAxesCombined, GoalIcon } from "lucide-react";

const GeneralSidebar = () => {
  const { t } = useTranslation("general");

  const { currentGeneralSection } = useSelector(
    (state: RootState) => state.project.sections.general,
  );

  const dispatch = useDispatch();

  return (
    <div className="flex flex-col w-full h-full px-4 py-6 gap-y-2 bg-slate-50 dark:text-gray-50 dark:bg-slate-900 border-l rounded-br-md border-slate-200 dark:border-slate-700">
      <h3
        data-testid="general-section-title"
        className="dark:text-gray-50 font-semibold text-gray-700 text-start"
      >
        {t("information")}
      </h3>
      <Button
        data-testid={`general-book`}
        onClick={() => dispatch(setCurrentGeneral(GeneralSections.bookInfo))}
        variant="ghost"
        size="default"
        className={cn(
          "w-full justify-start h-auto px-2 py-4 cursor-move",
          currentGeneralSection === GeneralSections.bookInfo && "bg-slate-200 dark:bg-slate-700",
        )}
      >
        <BookOpen />
        <span className="whitespace-normal break-words break-all max-w-full">{t("aboutBook")}</span>
      </Button>
      <Button
        data-testid={`goals`}
        onClick={() => dispatch(setCurrentGeneral(GeneralSections.goals))}
        variant="ghost"
        size="default"
        className={cn(
          "w-full justify-start h-auto px-2 py-4 cursor-move",
          currentGeneralSection === GeneralSections.goals && "bg-slate-200 dark:bg-slate-700",
        )}
      >
        <GoalIcon />
        <span className="whitespace-normal break-words break-all max-w-full">
          {t("goals.title")}
        </span>
      </Button>
      <Button
        data-testid={`statistics`}
        onClick={() => dispatch(setCurrentGeneral(GeneralSections.statistics))}
        variant="ghost"
        size="default"
        className={cn(
          "w-full justify-start h-auto px-2 py-4 cursor-move",
          currentGeneralSection === GeneralSections.statistics && "bg-slate-200 dark:bg-slate-700",
        )}
      >
        <ChartNoAxesCombined />
        <span className="whitespace-normal break-words break-all max-w-full">
          {t("statistics.title")}
        </span>
      </Button>
    </div>
  );
};
export default GeneralSidebar;
