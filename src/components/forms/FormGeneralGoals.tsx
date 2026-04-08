import { IProject } from "@/types/project.ts";
import React from "react";
import { Label } from "@/components/ui/label.tsx";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input.tsx";

interface FormGeneralGoalsProps {
  project: IProject;
}

const FormGeneralGoals: React.FC<FormGeneralGoalsProps> = ({ project }) => {
  const { t } = useTranslation("general");

  return (
    <form
      className="flex flex-col gap-4 items-start w-full h-full p-4"
      data-testid="form-general-goals"
    >
      <Label htmlFor="wordGoal">{t("goals.changeWordGoal")}</Label>
      <Input id="wordGoal" type="number" value={project.wordGoal} />
    </form>
  );
};
export default FormGeneralGoals;
