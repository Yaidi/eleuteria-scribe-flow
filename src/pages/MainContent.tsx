
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Settings, Moon, Sun, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Character {
  id: string;
  name: string;
  importance: 'main' | 'secondary' | 'minor';
  characteristics: string;
  about: string;
}

interface Plot {
  id: string;
  title: string;
  description: string;
  manuscriptReference: string;
  characters: string[];
}

interface WorldElement {
  id: string;
  category: string;
  title: string;
  description: string;
}

interface ProjectData {
  general: {
    title: string;
    author: string;
    subtitle: string;
    series: string;
    volume: string;
    genre: string;
    license: string;
  };
  characters: Character[];
  plots: Plot[];
  world: WorldElement[];
}

const MainContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(false);
  const [currentSection, setCurrentSection] = useState('general');
  const [autoSave, setAutoSave] = useState(true);
  const [projectData, setProjectData] = useState<ProjectData>({
    general: {
      title: '',
      author: '',
      subtitle: '',
      series: '',
      volume: '',
      genre: '',
      license: ''
    },
    characters: [],
    plots: [],
    world: []
  });

  const projectType = location.state?.projectType || 'novel';
  const template = location.state?.template || 'novel';

  const getSections = () => {
    switch (template) {
      case 'novel':
        return ['general', 'characters', 'world', 'plots', 'manuscript', 'resources'];
      case 'story':
        return ['general', 'characters', 'world', 'resume', 'manuscript', 'resources'];
      case 'thesis':
        return ['general', 'manuscript', 'references', 'bibliography', 'resources'];
      case 'poems':
        return ['general', 'manuscript', 'references', 'themes'];
      case 'illustrated':
        return ['legal', 'general', 'manuscript', 'illustrations', 'resources', 'final'];
      default:
        return ['general', 'manuscript', 'resources'];
    }
  };

  const sections = getSections();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleSave = () => {
    localStorage.setItem('eleuteria-project', JSON.stringify(projectData));
    toast({
      title: "Project saved",
      description: "Your work has been saved successfully.",
    });
  };

  const addCharacter = () => {
    const newCharacter: Character = {
      id: Date.now().toString(),
      name: '',
      importance: 'minor',
      characteristics: '',
      about: ''
    };
    setProjectData(prev => ({
      ...prev,
      characters: [...prev.characters, newCharacter]
    }));
  };

  const updateCharacter = (id: string, field: keyof Character, value: string) => {
    setProjectData(prev => ({
      ...prev,
      characters: prev.characters.map(char => 
        char.id === id ? { ...char, [field]: value } : char
      )
    }));
  };

  const removeCharacter = (id: string) => {
    setProjectData(prev => ({
      ...prev,
      characters: prev.characters.filter(char => char.id !== id)
    }));
  };

  const addPlot = () => {
    const newPlot: Plot = {
      id: Date.now().toString(),
      title: '',
      description: '',
      manuscriptReference: '',
      characters: []
    };
    setProjectData(prev => ({
      ...prev,
      plots: [...prev.plots, newPlot]
    }));
  };

  const updatePlot = (id: string, field: keyof Plot, value: string | string[]) => {
    setProjectData(prev => ({
      ...prev,
      plots: prev.plots.map(plot => 
        plot.id === id ? { ...plot, [field]: value } : plot
      )
    }));
  };

  const removePlot = (id: string) => {
    setProjectData(prev => ({
      ...prev,
      plots: prev.plots.filter(plot => plot.id !== id)
    }));
  };

  const addWorldElement = () => {
    const newElement: WorldElement = {
      id: Date.now().toString(),
      category: 'culture',
      title: '',
      description: ''
    };
    setProjectData(prev => ({
      ...prev,
      world: [...prev.world, newElement]
    }));
  };

  const updateWorldElement = (id: string, field: keyof WorldElement, value: string) => {
    setProjectData(prev => ({
      ...prev,
      world: prev.world.map(element => 
        element.id === id ? { ...element, [field]: value } : element
      )
    }));
  };

  const removeWorldElement = (id: string) => {
    setProjectData(prev => ({
      ...prev,
      world: prev.world.filter(element => element.id !== id)
    }));
  };

  useEffect(() => {
    const savedData = localStorage.getItem('eleuteria-project');
    if (savedData) {
      setProjectData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    if (autoSave) {
      const timer = setTimeout(() => {
        localStorage.setItem('eleuteria-project', JSON.stringify(projectData));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [projectData, autoSave]);

  const renderGeneralSection = () => (
    <Card>
      <CardHeader>
        <CardTitle>General Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={projectData.general.title}
              onChange={(e) => setProjectData(prev => ({
                ...prev,
                general: { ...prev.general, title: e.target.value }
              }))}
              placeholder="Enter book title"
            />
          </div>
          <div>
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              value={projectData.general.author}
              onChange={(e) => setProjectData(prev => ({
                ...prev,
                general: { ...prev.general, author: e.target.value }
              }))}
              placeholder="Enter author name"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="subtitle">Subtitle</Label>
          <Input
            id="subtitle"
            value={projectData.general.subtitle}
            onChange={(e) => setProjectData(prev => ({
              ...prev,
              general: { ...prev.general, subtitle: e.target.value }
            }))}
            placeholder="Enter subtitle (optional)"
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="series">Series</Label>
            <Input
              id="series"
              value={projectData.general.series}
              onChange={(e) => setProjectData(prev => ({
                ...prev,
                general: { ...prev.general, series: e.target.value }
              }))}
              placeholder="Series name"
            />
          </div>
          <div>
            <Label htmlFor="volume">Volume</Label>
            <Input
              id="volume"
              value={projectData.general.volume}
              onChange={(e) => setProjectData(prev => ({
                ...prev,
                general: { ...prev.general, volume: e.target.value }
              }))}
              placeholder="Volume number"
            />
          </div>
          <div>
            <Label htmlFor="genre">Genre</Label>
            <Select value={projectData.general.genre} onValueChange={(value) => setProjectData(prev => ({
              ...prev,
              general: { ...prev.general, genre: value }
            }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fiction">Fiction</SelectItem>
                <SelectItem value="non-fiction">Non-Fiction</SelectItem>
                <SelectItem value="fantasy">Fantasy</SelectItem>
                <SelectItem value="sci-fi">Science Fiction</SelectItem>
                <SelectItem value="mystery">Mystery</SelectItem>
                <SelectItem value="romance">Romance</SelectItem>
                <SelectItem value="thriller">Thriller</SelectItem>
                <SelectItem value="biography">Biography</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="license">License</Label>
          <Select value={projectData.general.license} onValueChange={(value) => setProjectData(prev => ({
            ...prev,
            general: { ...prev.general, license: value }
          }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select license" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="copyright">All Rights Reserved</SelectItem>
              <SelectItem value="cc-by">Creative Commons BY</SelectItem>
              <SelectItem value="cc-by-sa">Creative Commons BY-SA</SelectItem>
              <SelectItem value="cc-by-nc">Creative Commons BY-NC</SelectItem>
              <SelectItem value="public-domain">Public Domain</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );

  const renderCharactersSection = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Characters</CardTitle>
        <Button onClick={addCharacter} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Character
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {projectData.characters.map((character) => (
            <div key={character.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={character.name}
                      onChange={(e) => updateCharacter(character.id, 'name', e.target.value)}
                      placeholder="Character name"
                    />
                  </div>
                  <div>
                    <Label>Importance</Label>
                    <Select value={character.importance} onValueChange={(value: 'main' | 'secondary' | 'minor') => updateCharacter(character.id, 'importance', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main">Main Character</SelectItem>
                        <SelectItem value="secondary">Secondary Character</SelectItem>
                        <SelectItem value="minor">Minor Character</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button variant="destructive" size="sm" onClick={() => removeCharacter(character.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Characteristics</Label>
                  <Textarea
                    value={character.characteristics}
                    onChange={(e) => updateCharacter(character.id, 'characteristics', e.target.value)}
                    placeholder="Physical appearance, personality traits..."
                  />
                </div>
                <div>
                  <Label>About Character</Label>
                  <Textarea
                    value={character.about}
                    onChange={(e) => updateCharacter(character.id, 'about', e.target.value)}
                    placeholder="Background story, motivations, role in the story..."
                  />
                </div>
              </div>
            </div>
          ))}
          {projectData.characters.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No characters added yet. Click "Add Character" to get started.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderPlotsSection = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Plots</CardTitle>
        <Button onClick={addPlot} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Plot
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {projectData.plots.map((plot) => (
            <div key={plot.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <Label>Plot Title</Label>
                  <Input
                    value={plot.title}
                    onChange={(e) => updatePlot(plot.id, 'title', e.target.value)}
                    placeholder="Plot title"
                  />
                </div>
                <Button variant="destructive" size="sm" onClick={() => removePlot(plot.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={plot.description}
                    onChange={(e) => updatePlot(plot.id, 'description', e.target.value)}
                    placeholder="Describe what happens in this plot..."
                  />
                </div>
                <div>
                  <Label>Manuscript Reference</Label>
                  <Input
                    value={plot.manuscriptReference}
                    onChange={(e) => updatePlot(plot.id, 'manuscriptReference', e.target.value)}
                    placeholder="Chapter/page reference where this plot occurs"
                  />
                </div>
                <div>
                  <Label>Characters Involved</Label>
                  <Textarea
                    value={plot.characters.join(', ')}
                    onChange={(e) => updatePlot(plot.id, 'characters', e.target.value.split(', ').filter(Boolean))}
                    placeholder="List characters involved in this plot (comma-separated)"
                  />
                </div>
              </div>
            </div>
          ))}
          {projectData.plots.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No plots added yet. Click "Add Plot" to get started.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderWorldSection = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>World Building</CardTitle>
        <Button onClick={addWorldElement} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Element
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {projectData.world.map((element) => (
            <div key={element.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <div>
                    <Label>Category</Label>
                    <Select value={element.category} onValueChange={(value) => updateWorldElement(element.id, 'category', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="culture">Culture</SelectItem>
                        <SelectItem value="language">Language</SelectItem>
                        <SelectItem value="tradition">Tradition</SelectItem>
                        <SelectItem value="weather">Weather</SelectItem>
                        <SelectItem value="geography">Geography</SelectItem>
                        <SelectItem value="politics">Politics</SelectItem>
                        <SelectItem value="religion">Religion</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={element.title}
                      onChange={(e) => updateWorldElement(element.id, 'title', e.target.value)}
                      placeholder="Element title"
                    />
                  </div>
                </div>
                <Button variant="destructive" size="sm" onClick={() => removeWorldElement(element.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={element.description}
                  onChange={(e) => updateWorldElement(element.id, 'description', e.target.value)}
                  placeholder="Describe this world element in detail..."
                />
              </div>
            </div>
          ))}
          {projectData.world.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No world elements added yet. Click "Add Element" to get started.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderPlaceholderSection = (sectionName: string) => (
    <Card>
      <CardHeader>
        <CardTitle className="capitalize">{sectionName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-slate-500">
          <p>This section is coming soon!</p>
          <p className="text-sm mt-2">The {sectionName} workspace will be available in the next update.</p>
        </div>
      </CardContent>
    </Card>
  );

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'general':
        return renderGeneralSection();
      case 'characters':
        return renderCharactersSection();
      case 'plots':
        return renderPlotsSection();
      case 'world':
        return renderWorldSection();
      default:
        return renderPlaceholderSection(currentSection);
    }
  };

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <div className="w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Project</h2>
          <Button variant="ghost" size="sm" onClick={toggleDarkMode}>
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>

        <div className="space-y-2 mb-6">
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => setCurrentSection(section)}
              className={`w-full p-3 rounded-lg text-left transition-colors ${
                currentSection === section
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="capitalize">{section}</span>
            </button>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="w-full justify-start"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Button
            onClick={handleSave}
            size="sm"
            className="w-full justify-start"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>

        <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Auto-save</span>
            <button
              onClick={() => setAutoSave(!autoSave)}
              className={`w-8 h-4 rounded-full transition-colors ${
                autoSave ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                autoSave ? 'translate-x-4' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white dark:bg-slate-800 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {renderCurrentSection()}
        </div>
      </div>
    </div>
  );
};

export default MainContent;
