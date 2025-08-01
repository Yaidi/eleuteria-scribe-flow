import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Plus } from "lucide-react";
import { IPlot } from "@/types/sections.ts";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button.tsx";
import { addPlot, removePlot, updatePlot } from "@/store";
import { useProjectId, useSections } from "@/hooks/useSections.ts";
import { AppDispatch } from "@/store/config.ts";
import FormPlots from "@/components/FormPlots.tsx";

const Plot = () => {
  const { plots, currentPlot } = useSections().plots;
  const projectId = useProjectId();
  const dispatch = useDispatch<AppDispatch>();

  const add = () => {
    dispatch(addPlot(projectId));
  };

  const update = (plot: Partial<IPlot>) => {
    dispatch(updatePlot({ plot: plot }));
  };

  const remove = (id: number) => {
    dispatch(removePlot(id));
  };
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Plots</CardTitle>
        <Button data-testid="btn-add-plot" onClick={add} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Plot
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {currentPlot && (
            <FormPlots currentPlot={currentPlot} handleRemove={remove} handleUpdate={update} />
          )}
          {plots.length === 0 && (
            <div data-testid="no-plots" className="text-center py-8 text-slate-500">
              No plots added yet. Click "Add Plot" to get started.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Plot;
