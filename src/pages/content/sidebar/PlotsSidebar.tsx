import { PriorityType } from "@/types/sections.ts";
import { cn } from "@/lib/utils.ts";
import { Button } from "@/components/ui/button.tsx";
import { addPlot, setCurrentPlot, updatePlot } from "@/store";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useProjectId, useSections } from "@/hooks/useSections.ts";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/config.ts";
import { Plus } from "lucide-react";

const PlotsSidebar = () => {
  const { t } = useTranslation("plots");

  const { plots, currentPlot } = useSections().plots;
  const projectId = useProjectId();
  const [dragOverRole, setDragOverRole] = useState<PriorityType | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<number | null>(null);

  const dispatch = useDispatch<AppDispatch>();

  const changeImportancePlot = (plotId: number, importance: PriorityType) => {
    dispatch(updatePlot({ plot: { id: plotId, importance: importance } }));
  };
  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, plotId: number) => {
    e.dataTransfer.setData("text/plain", plotId.toString());
    setSelectedPlot(plotId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const add = () => {
    dispatch(addPlot(projectId));
  };

  return (
    <div className="flex flex-col px-4 py-6 gap-y-2 bg-slate-50 dark:text-gray-50 dark:bg-slate-900 border-l rounded-br-md border-slate-200 dark:border-slate-700 w-full">
      <div className="flex justify-between items-center">
        <h3
          data-testid="character-section-title"
          className="dark:text-gray-50 font-semibold text-gray-700"
        >
          {t("title")}
        </h3>
        <Button
          variant="ghost"
          data-testid="btn-add-plot"
          aria-label={t("add")}
          onClick={add}
          size="sm"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
      {[PriorityType.MAIN, PriorityType.SECONDARY, PriorityType.MINOR].map((role) => (
        <div
          id={PriorityType[role]}
          key={role}
          onDrop={(e) => {
            e.preventDefault();
            const plot = parseInt(e.dataTransfer.getData("text/plain"));
            setDragOverRole(null);
            changeImportancePlot(plot, role);
          }}
          onDragOver={(e) => handleDragOver(e)}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragOverRole(role);
          }}
          className={cn(
            "flex flex-col items-start px-2 gap-y-2 w-full dark:text-gray-100 text-gray-600 rounded-lg",
            dragOverRole === role &&
              "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
          )}
        >
          <h4 className="text-xs font-medium uppercase tracking-wide pb-2 border-b-2 w-full text-start">
            {t(`importance.${role}`)}
          </h4>
          {plots
            .filter((plot) => plot.importance === role)
            .map((plot) => (
              <Button
                data-testid={`plot-${plot.id}`}
                draggable
                onDragEnd={() => setSelectedPlot(null)}
                onDragStart={(e) => handleDragStart(e, plot.id)}
                onClick={() => dispatch(setCurrentPlot(plot))}
                key={plot.id.toString()}
                variant="ghost"
                size="default"
                className={cn(
                  "w-full justify-start h-7 px-2 text-xs cursor-move",
                  currentPlot?.id === plot.id && "bg-slate-200 dark:bg-slate-700",
                  selectedPlot === plot.id && "opacity-50",
                )}
              >
                <div className="w-3 h-3 rounded-full" />
                {plot.title}
              </Button>
            ))}
        </div>
      ))}
    </div>
  );
};
export default PlotsSidebar;
