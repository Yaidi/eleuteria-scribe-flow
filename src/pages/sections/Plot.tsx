import { Card } from "@/components/ui/card.tsx";
import { IPlot } from "@/types/sections.ts";
import { useDispatch } from "react-redux";
import { removePlot, updatePlot } from "@/store";
import { useSections } from "@/hooks/useSections.ts";
import { AppDispatch } from "@/store/config.ts";
import FormPlots from "@/components/forms/FormPlots.tsx";

const Plot = () => {
  const { plots, currentPlot } = useSections().plots;
  const dispatch = useDispatch<AppDispatch>();

  const update = (plot: Partial<IPlot>) => {
    dispatch(updatePlot({ plot: plot }));
  };

  const remove = (id: number) => {
    dispatch(removePlot(id));
  };
  return (
    <Card className="w-full overflow-y-auto">
      {currentPlot && (
        <FormPlots currentPlot={currentPlot} handleRemove={remove} handleUpdate={update} />
      )}
      {plots.length === 0 && (
        <div data-testid="no-plots" className="text-center py-8 text-slate-500">
          No plots added yet. Click "Add Plot" to get started.
        </div>
      )}
      {plots.length > 0 && !currentPlot && (
        <div data-testid="select-plot" className="text-center py-8 text-slate-500">
          Please select a plot to view or edit its details.
        </div>
      )}
    </Card>
  );
};

export default Plot;
