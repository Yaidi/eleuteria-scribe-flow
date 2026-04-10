import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { IWorldElement } from "@/types/sections.ts";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/config.ts";
import { removeWorldElement, updateWorldElement } from "@/store";
import FormWorld from "@/components/forms/FormWorld.tsx";
import { util } from "zod";
import objectKeys = util.objectKeys;
import { useTranslation } from "react-i18next";
import { useSections } from "@/hooks/useSections.ts";

const World = () => {
  const { t } = useTranslation("world");

  const { currentWorldElement, worldElements } = useSections().world;
  const dispatch = useDispatch<AppDispatch>();

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
      </CardHeader>
      {currentWorldElement && (
        <FormWorld
          currentWorldElement={currentWorldElement}
          remove={remove}
          update={update}
        ></FormWorld>
      )}
      {objectKeys(worldElements).length === 0 && (
        <div className="text-center py-8 text-slate-500">{t("element.noElements")}</div>
      )}
    </Card>
  );
};

export default World;
