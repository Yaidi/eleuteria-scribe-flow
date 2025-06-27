import {Button} from "@/components/ui/button.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Progress} from "@/components/ui/progress.tsx";
import {Save, Settings} from "lucide-react";
import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {ProjectData} from "@/types/project.tsx";
import {ESections} from "@/types/sections.tsx";
import {useToast} from "@/hooks/use-toast.ts";

export interface MainHeaderProps {
    currentProject: ProjectData,
    currentSection: ESections
}

const MainHeader: React.FC<MainHeaderProps> = ({currentProject, currentSection}) => {
    const [autoSave, setAutoSave] = useState(true);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        if (autoSave) {
            const timer = setTimeout(() => {
                localStorage.setItem('eleuteria-project', JSON.stringify(currentProject));
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [currentProject, autoSave]);

    const getProgressPercentage = () => {
        if (!currentProject.wordGoal || !currentProject.words) return 0;
        return (currentProject.words / currentProject.wordGoal) * 100;
    };

    const handleSave = () => {
        localStorage.setItem('eleuteria-project', JSON.stringify(currentProject));
        toast({
            title: "Project saved",
            description: "Your work has been saved successfully.",
        });
    };

    return (
        <header className="px-6 py-4 border-b bg-amber-300 border-gray-200 bg-white/90 backdrop-blur-sm flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={()=> navigate('/')}
                    className="flex items-center space-x-2"
                >
                </Button>
                <div className="h-6 w-px bg-gray-300" />
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {currentSection.toString()}
                    </h1>
                    <div className="flex items-center space-x-4 mt-1">
                        <Badge variant="outline" className="text-xs">
                            {currentProject.type}
                        </Badge>
                        <span className="text-sm text-gray-500">
                    {
                        currentProject.wordGoal ? `${currentProject.words} / ${currentProject.wordGoal} words` : ''
                    }
                  </span>
                        <Progress
                            value={getProgressPercentage()}
                            className="w-32 h-2"
                        />
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
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
                </Button>
                <Button onClick={handleSave} size="sm">
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
        </header>
    )
}
export default MainHeader;