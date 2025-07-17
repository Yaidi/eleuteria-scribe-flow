import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { useNavigate } from "react-router-dom";
import { FileText, Moon, Sun } from "lucide-react";
import { addProjectFetch, projectsFetch } from "@/store/projects/slice.ts";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/config.ts";
import { ProjectType } from "@/types/project.ts";
import { getTemplates } from "@/https/fetch.ts";
import { Template } from "@/types/templates.ts";
import Templates from "@/pages/welcome/Templates.tsx";
import MainTemplate from "@/pages/welcome/MainTemplate.tsx";

const Welcome = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectType>(ProjectType.NOVEL);
  const [darkMode, setDarkMode] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const [templates, setTemplates] = useState<Template[]>([]);
  const navigate = useNavigate();

  const handleTemplateSelect = (template: ProjectType) => {
    setSelectedTemplate(template);
  };

  useEffect(() => {
    void dispatch(projectsFetch());
    getTemplates().then((res) => setTemplates(res.templates));
  }, [dispatch]);

  const handleCreateProject = async (type: ProjectType) => {
    try {
      await dispatch(addProjectFetch({ projectListID: 1, type })).unwrap();
      navigate("/main");
    } catch (error) {
      console.error("Error al crear el proyecto:", error);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div data-testid="welcome-container" className={`min-h-screen flex ${darkMode ? "dark" : ""}`}>
      {/* Sidebar */}
      <div className="w-80 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Eleuteria</h1>
          </div>
          <Button data-testid="btn-dark-mode" variant="ghost" size="sm" onClick={toggleDarkMode}>
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>

        <Templates
          templates={templates}
          handleTemplateSelect={handleTemplateSelect}
          selectedTemplate={selectedTemplate}
        ></Templates>
      </div>

      {/* Main Content */}
      <MainTemplate
        templates={templates}
        selectedTemplate={selectedTemplate}
        handleCreateProject={handleCreateProject}
      ></MainTemplate>
    </div>
  );
};

export default Welcome;
