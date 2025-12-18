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
import { useTranslation } from "react-i18next";

const World = () => {
  const { t } = useTranslation("world");

  const { world, currentWorldElement, worldElements } = useSelector(
    (state: RootState) => state.sections.world,
  );
  const dispatch = useDispatch<AppDispatch>();

  const add = (id: number) => {
    dispatch(addWorldElement(id));
  };

  const worldParentName = (current: IWorldElement) => {
    if (current.parentId != null) {
      return worldElements[current.parentId].name;
    } else {
      return current.name;
    }
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
        <CardTitle>
          {currentWorldElement != null ? worldParentName(currentWorldElement) : t("title")}
        </CardTitle>
        <Button onClick={() => add(world!.id)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          {t("element.add")}
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
        <div className="text-center py-8 text-slate-500">{t("element.noElements")}</div>
      )}
    </Card>
  );
};

export default World;
