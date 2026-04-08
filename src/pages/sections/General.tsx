import { useProjectInfo, useSections } from "@/hooks/useSections.ts";
import { useTranslation } from "react-i18next";
import FormGeneralBook from "@/components/forms/FormGeneralBook.tsx";
import { GeneralSections, IGeneral } from "@/types/sections.ts";
import { TFunction } from "i18next";
import FormGeneralGoals from "@/components/forms/FormGeneralGoals.tsx";
import { IProject } from "@/types/project.ts";

const General = () => {
  const { general, currentGeneralSection } = useSections().general;
  const project = useProjectInfo();
  const { t } = useTranslation("general");

  if (!project) {
    return null;
  }

  return (
    <section className="p-2 h-full">
      {switchSection(currentGeneralSection, general, t, project)}
    </section>
  );
};
export default General;

const switchSection = (
  section: GeneralSections,
  general: IGeneral,
  t: TFunction<"general", undefined>,
  project: IProject,
) => {
  switch (section) {
    case GeneralSections.bookInfo:
      return (
        <div>
          <h2 className="text-2xl font-semibold mb-4">{t("aboutBook")}</h2>
          <FormGeneralBook general={general} projectId={project.id} />
        </div>
      );
    case GeneralSections.goals:
      return (
        <div>
          <h2 className="text-2xl font-semibold mb-4">{t("goals.title")}</h2>
          <FormGeneralGoals project={project} />
        </div>
      );
  }
};
