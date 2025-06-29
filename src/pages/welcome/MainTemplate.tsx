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
import { FileText } from "lucide-react";

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
  const getTemplate = templates.find((el) => el.type === selectedTemplate);

  return (
    <div className="flex-1 bg-white dark:bg-slate-800 p-8">
      {!selectedTemplate && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
              Welcome to Eleuteria
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Select a template from the sidebar to get started
            </p>
          </div>
        </div>
      )}

      {selectedTemplate && getTemplate && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="capitalize">{selectedTemplate} Template</CardTitle>
            <CardDescription>{getTemplate.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Project Structure:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {getTemplate.sections.map((section, index) => (
                    <div key={index} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {section}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={() => void handleCreateProject(selectedTemplate)} className="w-full">
                Choose This Template
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <>
        {selectedTemplate === ProjectType.NON_FICTION && (
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
                  onClick={() => void handleCreateProject(ProjectType.NON_FICTION)}
                  className="w-full"
                >
                  Create Template
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedTemplate === ProjectType.NON_FICTION && (
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
                  onClick={() => void handleCreateProject(ProjectType.NON_FICTION)}
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
