import React from "react";
import { Template } from "@/types/templates.ts";
import { ProjectType } from "@/types/project.ts";
import ButtonTemplate from "@/pages/welcome/ButtonTemplate.tsx";
import { useTranslation } from "react-i18next";

export interface TemplatesProps {
  templates: Template[];
  handleTemplateSelect: (template: ProjectType) => void;
  selectedTemplate: ProjectType;
}

const Templates: React.FC<TemplatesProps> = ({
  templates,
  selectedTemplate,
  handleTemplateSelect,
}) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">
        {t("welcome.selectTemplate")}
      </h2>
      {templates.map((template) => (
        <ButtonTemplate
          template={template}
          selectedTemplate={selectedTemplate}
          handleTemplateSelect={handleTemplateSelect}
          key={`${template.type}-btn`}
        ></ButtonTemplate>
      ))}
    </div>
  );
};

export default Templates;
