import {Button} from "@/components/ui/button.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Progress} from "@/components/ui/progress.tsx";
import { Save} from "lucide-react";
import React, {useEffect, useState} from "react";
import {ProjectData} from "@/types/project.tsx";
import {ESections} from "@/types/sections.ts";
import {useToast} from "@/hooks/use-toast.ts";

export interface MainHeaderProps {
    currentProject: ProjectData,
    currentSection: ESections
}

const MainHeader: React.FC<MainHeaderProps> = ({currentProject, currentSection}) => {
    const [autoSave, setAutoSave] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (autoSave) {
            const timer = setTimeout(() => {
                localStorage.setItem('eleuteria-project', JSON.stringify(currentProject));
            }, 2);
            return () => {
                clearTimeout(timer)
                setAutoSave(false)
            };
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
            <div className="flex justify-between items-center space-x-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {currentSection.toString()}
                    </h1>
                    <div className="flex items-center space-x-4 mt-1">
                        <Badge variant="outline" className="text-xs">
                            {currentProject.type}
                        </Badge>
                        {
                            currentProject.wordGoal && (
                                <>
                                    <span className="text-sm text-gray-500">
                    {`${currentProject.words} / ${currentProject.wordGoal} words`}
                                </span>
                                    <Progress
                                        value={getProgressPercentage()}
                                        className="w-32 h-2"
                                    />
                                </>

                            )
                        }
                    </div>
                </div>
            </div>
            <section className="flex justify-center items-center space-x-2">
                <Button onClick={handleSave} size="sm">
                    <Save className="w-4 h-4" />
                    Save
                </Button>
            </section>
        </header>
    )
}
export default MainHeader;