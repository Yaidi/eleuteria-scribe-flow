import React from "react";
import { Template } from "@/types/templates.ts";
import { ProjectType } from "@/types/project.ts";
import { BookOpen, GraduationCap, Heart, Image, Plus, PlusCircle } from "lucide-react";

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
  switch (template.type) {
    case ProjectType.NOVEL:
      return (
        <button
          onClick={() => handleTemplateSelect(ProjectType.NOVEL)}
          className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
            selectedTemplate === ProjectType.NOVEL
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
          }`}
        >
          <div className="flex items-center space-x-3">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-slate-800 dark:text-slate-200">Novel</span>
          </div>
        </button>
      );
    case ProjectType.THESIS:
      return (
        <button
          onClick={() => handleTemplateSelect(ProjectType.THESIS)}
          className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
            selectedTemplate === ProjectType.THESIS
              ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
          }`}
        >
          <div className="flex items-center space-x-3">
            <GraduationCap className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-slate-800 dark:text-slate-200">Thesis</span>
          </div>
        </button>
      );
    case ProjectType.POETRY:
      return (
        <button
          onClick={() => handleTemplateSelect(ProjectType.POETRY)}
          className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
            selectedTemplate === ProjectType.POETRY
              ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20"
              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
          }`}
        >
          <div className="flex items-center space-x-3">
            <Heart className="w-5 h-5 text-pink-600" />
            <span className="font-medium text-slate-800 dark:text-slate-200">Poems</span>
          </div>
        </button>
      );
    case ProjectType.ILLUSTRATED:
      return (
        <button
          onClick={() => handleTemplateSelect(template.type)}
          className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
            selectedTemplate === ProjectType.ILLUSTRATED
              ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
          }`}
        >
          <div className="flex items-center space-x-3">
            <Image className="w-5 h-5 text-orange-600" />
            <span className="font-medium text-slate-800 dark:text-slate-200">Illustrated Book</span>
          </div>
        </button>
      );
    case ProjectType.TRILOGY:
      return (
        <button
          onClick={() => handleTemplateSelect(ProjectType.TRILOGY)}
          className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
            selectedTemplate === ProjectType.TRILOGY
              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
          }`}
        >
          <div className="flex items-center space-x-3">
            <Plus className="w-5 h-5 text-indigo-600" />
            <span className="font-medium text-slate-800 dark:text-slate-200">
              Create New Template
            </span>
          </div>
        </button>
      );
    case ProjectType.NON_FICTION:
      return (
        <button
          onClick={() => handleTemplateSelect(ProjectType.NON_FICTION)}
          className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
            selectedTemplate === ProjectType.NON_FICTION
              ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
          }`}
        >
          <div className="flex items-center space-x-3">
            <PlusCircle className="w-5 h-5 text-teal-600" />
            <span className="font-medium text-slate-800 dark:text-slate-200">Create New Book</span>
          </div>
        </button>
      );
  }
};
export default ButtonTemplate;
