import { Template } from "@/types/templates.ts";
import { ProjectType } from "@/types/project.ts";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { useTranslation } from "react-i18next";

export interface MainTemplateProps {
  templates: Template[];
  handleCreateProject: (template: ProjectType) => void;
  selectedTemplate: ProjectType;
}
const MainTemplate: React.FC<MainTemplateProps> = ({
  templates,
  handleCreateProject,
  selectedTemplate,
}) => {
  const { t } = useTranslation("");
  const getTemplate = templates.find((el) => el.type === selectedTemplate);

  return (
    <div className="flex-1 bg-white dark:bg-slate-800 p-8">
      {selectedTemplate && getTemplate && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle data-testid="template-name" className="">
              {t("templates:title", { name: t(`project:type.${selectedTemplate}`) })}
            </CardTitle>
            <CardDescription>{t(`templates:type.${selectedTemplate}`)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">{t("templates:structureProject")}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {getTemplate.sections.map((section, index) => (
                    <div key={index} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {t(`sections:${section.toLowerCase()}`)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                data-testid="btn-create-project"
                onClick={() => void handleCreateProject(selectedTemplate)}
                className="w-full"
              >
                {t("templates:chooseTemplate")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <>
        {selectedTemplate === ProjectType.non_fiction && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Create Custom Template</CardTitle>
              <CardDescription>Design your own project structure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template-title">Template Title</Label>
                  <Input id="template-title" placeholder="Enter template name" />
                </div>
                <div>
                  <Label htmlFor="manuscript-number">Number of Manuscripts</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select number" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sections">Additional Sections</Label>
                  <Textarea
                    id="sections"
                    placeholder="Enter section names separated by commas (e.g., World, Resources, Notes)"
                  />
                </div>
                <Button
                  onClick={() => void handleCreateProject(ProjectType.non_fiction)}
                  className="w-full"
                >
                  Create Template
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedTemplate === ProjectType.non_fiction && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Create New Book</CardTitle>
              <CardDescription>Start writing your new project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="book-title">Book Title</Label>
                  <Input id="book-title" value={0} placeholder="Enter your book title" />
                </div>
                <Button
                  onClick={() => void handleCreateProject(ProjectType.non_fiction)}
                  className="w-full"
                >
                  Create Book
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </>
    </div>
  );
};

export default MainTemplate;
