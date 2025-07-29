import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/config.ts";
import { IProject, State } from "@/types/project.ts";
import { getProjectFetch, removeProject } from "@/store";
import { useToast } from "@/hooks/use-toast.ts";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarProjects from "@/pages/projects/SidebarProjects.tsx";
import Project from "@/pages/projects/Project.tsx";

const Projects = () => {
  const { projects, state } = useSelector((state: RootState) => state.projects);
  const [currentProject, setCurrentProject] = useState<IProject | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const remove = (projectId: number, projectName: string) => {
    dispatch(removeProject(projectId)).unwrap();
    toast({
      title: `Removed Project ${projectName}`,
      description: "Your project was been removed!",
    });
    setCurrentProject(null);
  };
  const chooseProject = (id: number) => {
    dispatch(getProjectFetch(id)).unwrap();
    navigate("/main");
  };

  useEffect(() => {
    if (projects.length === 0 && state != State.LOADING) {
      navigate("/template");
    }
  }, [navigate, projects, state]);
  if (state == State.LOADING) {
    return <div data-testid="project-loading">Loading...</div>;
  }
  return (
    <div className="flex h-full w-full">
      <SidebarProjects projects={projects} handleProject={setCurrentProject} />
      <Project
        project={currentProject}
        handleRemove={remove}
        handleProject={chooseProject}
      ></Project>
    </div>
  );
};
export default Projects;
