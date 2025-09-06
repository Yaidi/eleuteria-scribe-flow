import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { IWorldElement } from "@/types/sections.ts";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/config.ts";
import { Button } from "@/components/ui/button.tsx";
import { addWorldElement, removeWorldElement, updateWorldElement } from "@/store";
import FormWorld from "@/components/forms/FormWorld.tsx";
import { util } from "zod";
import objectKeys = util.objectKeys;

const World = () => {
  const { world, currentWorldElement, worldElements } = useSelector(
    (state: RootState) => state.sections.world,
  );
  const dispatch = useDispatch<AppDispatch>();

  const add = (id: number) => {
    dispatch(addWorldElement(id));
  };

  const update = (worldElement: IWorldElement) => {
    dispatch(updateWorldElement(worldElement));
  };

  const remove = (id: number) => {
    dispatch(removeWorldElement(id));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>World Building</CardTitle>
        <Button onClick={() => add(world!.id)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Element
        </Button>
      </CardHeader>
      <CardContent>
        {currentWorldElement && (
          <FormWorld
            currentWorldElement={currentWorldElement}
            remove={remove}
            update={update}
          ></FormWorld>
        )}
      </CardContent>
      {objectKeys(worldElements).length === 0 && (
        <div className="text-center py-8 text-slate-500">
          No world elements added yet. Click "Add Element" to get started.
        </div>
      )}
    </Card>
  );
};

export default World;
