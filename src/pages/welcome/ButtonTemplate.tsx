import React from "react";
import { Template } from "@/types/templates.ts";
import { ProjectType } from "@/types/project.ts";
import { BookOpen, GraduationCap, Heart, Image, Plus, PlusCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ButtonTemplateProps {
  template: Template;
  handleTemplateSelect: (template: ProjectType) => void;
  selectedTemplate: ProjectType;
}
const ButtonTemplate: React.FC<ButtonTemplateProps> = ({
  template,
  handleTemplateSelect,
  selectedTemplate,
}) => {
  const { t } = useTranslation("project");

  switch (template.type) {
    case ProjectType.novel:
      return (
        <button
          data-testid="btn-novel"
          onClick={() => handleTemplateSelect(ProjectType.novel)}
          className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
            selectedTemplate === ProjectType.novel
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
          }`}
        >
          <div className="flex items-center space-x-3">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-slate-800 dark:text-slate-200 capitalize">
              {t("type.novel")}
            </span>
          </div>
        </button>
      );
    case ProjectType.thesis:
      return (
        <button
          data-testid="btn-thesis"
          onClick={() => handleTemplateSelect(ProjectType.thesis)}
          className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
            selectedTemplate === ProjectType.thesis
              ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
          }`}
        >
          <div className="flex items-center space-x-3">
            <GraduationCap className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-slate-800 dark:text-slate-200 capitalize">
              {t("type.thesis")}
            </span>
          </div>
        </button>
      );
    case ProjectType.poetry:
      return (
        <button
          data-testid="btn-poetry"
          onClick={() => handleTemplateSelect(ProjectType.poetry)}
          className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
            selectedTemplate === ProjectType.poetry
              ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20"
              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
          }`}
        >
          <div className="flex items-center space-x-3">
            <Heart className="w-5 h-5 text-pink-600" />
            <span className="font-medium text-slate-800 dark:text-slate-200 capitalize">
              {t("type.poetry")}
            </span>
          </div>
        </button>
      );
    case ProjectType.illustrated:
      return (
        <button
          data-testid="btn-illustrated"
          onClick={() => handleTemplateSelect(template.type)}
          className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
            selectedTemplate === ProjectType.illustrated
              ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
          }`}
        >
          <div className="flex items-center space-x-3">
            <Image className="w-5 h-5 text-orange-600" />
            <span className="font-medium text-slate-800 dark:text-slate-200 capitalize">
              {t("type.illustrated")}
            </span>
          </div>
        </button>
      );
    case ProjectType.trilogy:
      return (
        <button
          data-testid="btn-trilogy"
          onClick={() => handleTemplateSelect(ProjectType.trilogy)}
          className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
            selectedTemplate === ProjectType.trilogy
              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
          }`}
        >
          <div className="flex items-center space-x-3">
            <Plus className="w-5 h-5 text-indigo-600" />
            <span className="font-medium text-slate-800 dark:text-slate-200 capitalize">
              {t("type.trilogy")}
            </span>
          </div>
        </button>
      );
    case ProjectType.non_fiction:
      return (
        <button
          data-testid="btn-non-fiction"
          onClick={() => handleTemplateSelect(ProjectType.non_fiction)}
          className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
            selectedTemplate === ProjectType.non_fiction
              ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
          }`}
        >
          <div className="flex items-center space-x-3">
            <PlusCircle className="w-5 h-5 text-teal-600" />
            <span className="font-medium text-slate-800 dark:text-slate-200 capitalize">
              {t("type.non_fiction")}
            </span>
          </div>
        </button>
      );
  }
};
export default ButtonTemplate;
