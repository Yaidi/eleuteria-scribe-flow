import { IProject } from "@/types/project.ts";
import React from "react";
import { Calendar, Clock, Target, Trash, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { formatDate } from "date-fns";
import { Progress } from "@/components/ui/progress.tsx";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useTranslation } from "react-i18next";

export interface ProjectProps {
  project: IProject | null;
  handleRemove: (id: number, name: string) => void;
  handleProject: (id: number) => void;
}
const Project: React.FC<ProjectProps> = ({ project, handleRemove, handleProject }) => {
  const { t } = useTranslation("project");

  if (!project) return null;
  const progressPercentage = Math.round((project.words / project.wordGoal) * 100);
  return (
    <div data-testid="project" className="flex flex-col p-6 space-y-6 w-3/4">
      <header className="flex flex-col">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text self-start">
          {project.projectName}
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed self-start pb-2">
          {project.description}
        </p>
        <aside className="flex justify-start">
          <Badge
            data-testid="badge-type"
            variant="secondary"
            className="text-xs mr-2 px-2 py-0.5 dark:text-slate-400 capitalize"
          >
            {t(`type.${project.type}`)}
          </Badge>
          <Badge
            data-testid="badge-status"
            variant="status"
            status={project.status}
            className="text-xs px-2 py-0.5 capitalize"
          >
            {t(`status.${project.status}`)}
          </Badge>
        </aside>
      </header>
      <Separator />
      <ScrollArea className="flex-2 flex-col space-y-6 overflow-auto mb-4 h-auto">
        <main className="flex flex-col md:flex-row gap-4">
          <Card className="bg-gradient-secondary flex-1">
            <CardHeader className="flex flex-row items-center space-y-0 gap-2 pb-2">
              <CardTitle className="text-sm font-medium">{t("wordCount")}</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent data-testid="words-goal">
              <div className="text-2xl font-bold text-primary">{project.words}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-secondary flex-1">
            <CardHeader className="flex flex-row items-center space-y-0 gap-2 pb-2">
              <CardTitle className="text-sm font-medium">{t("progress")}</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{progressPercentage}%</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-secondary flex-1">
            <CardHeader className="flex flex-row items-center space-y-0 gap-2 pb-2">
              <CardTitle className="text-sm font-medium">{t("created")}</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-sm text-primary font-bold">
                {formatDate(project.created, "do MMMM yyyy")}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-secondary flex-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("lastUpdated")}</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-sm text-primary font-bold">
                {formatDate(project.updated, "do MMMM yyyy")}
              </div>
            </CardContent>
          </Card>
        </main>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {t("writtingProgress")}
            </CardTitle>
            <CardDescription>{t("trackProgress")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t("progress")}</span>
                <span>{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-2xl font-bold text-primary">{project.words}</p>
                <p className="text-xs text-muted-foreground">{t("progressInfo.current")}</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-muted-foreground">{project.wordGoal}</p>
                <p className="text-xs text-muted-foreground">{t("progressInfo.target")}</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-orange-500">
                  {project.wordGoal - project.words}
                </p>
                <p className="text-xs text-muted-foreground">{t("progressInfo.remaining")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </ScrollArea>
      <section className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Button onClick={() => handleProject(project.id)}>{t("openProject")}</Button>
        <Button
          data-testid="btn-rm-project"
          onClick={() => handleRemove(project.id, project.projectName)}
        >
          <Trash></Trash>
          {t("delete")}
        </Button>
      </section>
    </div>
  );
};
export default Project;
