import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Textarea} from '@/components/ui/textarea';
import {useNavigate} from 'react-router-dom';
import {BookOpen, FileText, GraduationCap, Heart, Image, Moon, Plus, PlusCircle, Sun} from 'lucide-react';
import {addProjectFetch} from "@/store/projects/slice.ts";
import {useDispatch} from "react-redux";
import {AppDispatch} from "@/store/config.tsx";
import {ProjectType} from "@/types/project.ts";

interface TemplateStructure {
  sections: string[];
  description: string;
}

const templates: Record<string, TemplateStructure> = {
  Novel: {
    sections: ['General', 'Characters', 'World', 'Plots', 'Manuscript', 'Resources'],
    description: 'Perfect for long-form fiction with complex characters and world-building'
  },
  Trilogy: {
    sections: ['General', 'Manuscript', 'References', 'Bibliography', 'Resources'],
    description: 'Academic writing with proper citation and reference management'
  },
  Poetry: {
    sections: ['General', 'Manuscript', 'References', 'Themes'],
    description: 'Poetry collections with thematic organization'
  },
  'Non-fiction': {
    sections: ['Legal and Credits', 'General', 'Manuscript', 'Illustrations', 'Resources', 'Final page'],
    description: 'Picture books and illustrated works with visual elements'
  }
};

const Welcome = () => {
  const featureEnabled = import.meta.env.VITE_FEATURES;
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectType>(ProjectType.NOVEL);
  const [darkMode, setDarkMode] = useState(false);
  const [customTemplate, setCustomTemplate] = useState({
    title: '',
    manuscriptNumber: '',
    sections: ''
  });
  const dispatch = useDispatch<AppDispatch>()
  const [newBook, setNewBook] = useState({ title: '' });
  const navigate = useNavigate();

  const handleTemplateSelect = (template: ProjectType) => {
    setSelectedTemplate(template);
  };

  const handleCreateProject = async (type: ProjectType) => {
    try {
      await dispatch(addProjectFetch({ projectListID: 1, type })).unwrap();
      navigate('/main', {
        state: {
          projectType: type,
          template: selectedTemplate,
          customTemplate,
          newBook
        }
      });
    } catch (error) {
      console.error('Error al crear el proyecto:', error);
    }
  };


  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <div className="w-80 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Eleuteria</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={toggleDarkMode}>
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">Choose Template</h2>

          <button
            onClick={() => handleTemplateSelect(ProjectType.NOVEL)}
            className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
              selectedTemplate === 'Novel' 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-center space-x-3">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-slate-800 dark:text-slate-200">Novel</span>
            </div>
          </button>
          <button
            onClick={() => handleTemplateSelect(ProjectType.THESIS)}
            className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
              selectedTemplate === 'Trilogy' 
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-center space-x-3">
              <GraduationCap className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-slate-800 dark:text-slate-200">Thesis</span>
            </div>
          </button>

          <button
            onClick={() => handleTemplateSelect(ProjectType.POETRY)}
            className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
              selectedTemplate === 'Poetry' 
                ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20' 
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Heart className="w-5 h-5 text-pink-600" />
              <span className="font-medium text-slate-800 dark:text-slate-200">Poems</span>
            </div>
          </button>

          <button
            onClick={() => handleTemplateSelect(ProjectType.ILLUSTRATED)}
            className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
              selectedTemplate === 'Non-fiction' 
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Image className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-slate-800 dark:text-slate-200">Illustrated Book</span>
            </div>
          </button>

          {
              featureEnabled == 'true' && (
                  <>
                <button
                    onClick={() => handleTemplateSelect(ProjectType.TRILOGY)}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
                        selectedTemplate === ProjectType.TRILOGY
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <Plus className="w-5 h-5 text-indigo-600" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">Create New Template</span>
                  </div>
                </button>
            <button
            onClick={() => handleTemplateSelect(ProjectType.NON_FICTION)}
          className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
              selectedTemplate === ProjectType.NON_FICTION
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          <div className="flex items-center space-x-3">
            <PlusCircle className="w-5 h-5 text-teal-600" />
            <span className="font-medium text-slate-800 dark:text-slate-200">Create New Book</span>
          </div>
        </button>
            </>
              )
          }


        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white dark:bg-slate-800 p-8">
        {!selectedTemplate && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-12 h-12 text-slate-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Welcome to Eleuteria</h2>
              <p className="text-slate-600 dark:text-slate-400">Select a template from the sidebar to get started</p>
            </div>
          </div>
        )}

        {selectedTemplate && templates[selectedTemplate] && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="capitalize">{selectedTemplate} Template</CardTitle>
              <CardDescription>{templates[selectedTemplate].description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Project Structure:</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {templates[selectedTemplate].sections.map((section, index) => (
                      <div key={index} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{section}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button onClick={() => handleCreateProject(selectedTemplate)} className="w-full">
                  Choose This Template
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {
          featureEnabled == 'true' && (
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
                            <Input
                                id="template-title"
                                value={customTemplate.title}
                                onChange={(e) => setCustomTemplate({...customTemplate, title: e.target.value})}
                                placeholder="Enter template name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="manuscript-number">Number of Manuscripts</Label>
                            <Select value={customTemplate.manuscriptNumber} onValueChange={(value) => setCustomTemplate({...customTemplate, manuscriptNumber: value})}>
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
                                value={customTemplate.sections}
                                onChange={(e) => setCustomTemplate({...customTemplate, sections: e.target.value})}
                                placeholder="Enter section names separated by commas (e.g., World, Resources, Notes)"
                            />
                          </div>
                          <Button onClick={() => handleCreateProject(ProjectType.NON_FICTION)} className="w-full">
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
                            <Input
                                id="book-title"
                                value={newBook.title}
                                onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                                placeholder="Enter your book title"
                            />
                          </div>
                          <Button onClick={() => handleCreateProject(ProjectType.NON_FICTION)} className="w-full">
                            Create Book
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                )}</>
            )
        }
      </div>
    </div>
  );
};

export default Welcome;
