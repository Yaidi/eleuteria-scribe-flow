import { cn } from "@/lib/utils.ts";
import { addWorldElement, updateWorldElement } from "@/store";
import React, { useState } from "react";
import { AppDispatch } from "@/store/config.ts";
import { useDispatch } from "react-redux";
import { useSections } from "@/hooks/useSections.ts";
import { IWorldElement, IWorldElementWithChildren } from "@/types/sections.ts";
import WorldElementNode from "@/components/world/WorldElementNode.tsx";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { Plus } from "lucide-react";

const WorldSidebar = () => {
  const { t } = useTranslation("world");

  const { worldElements, world, currentWorldElement } = useSections().world;
  const dispatch = useDispatch<AppDispatch>();
  const [dragOverElement, setDragOverElement] = useState<number | null>(null);

  const handleDragStart = (
    e: React.DragEvent<HTMLButtonElement>,
    elementId: number,
    setSelectedElement: (arg0: number) => void,
  ) => {
    e.dataTransfer.setData("text/plain", elementId.toString());
    setSelectedElement(elementId);
  };

  const handleDragEnter = (elementId: number) => {
    setDragOverElement(elementId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement | HTMLButtonElement>,
    parentId: number | null,
  ) => {
    e.preventDefault();
    const elementId = parseInt(e.dataTransfer.getData("text/plain"));
    setDragOverElement(null);
    const parentElement = parentId ? worldElements[parentId] : null;
    if (parentElement?.parentId != null && parentElement.childrenIds.length > 0) return;
    changeWorldElementParent(worldElements[elementId], parentId);
  };

  const changeWorldElementParent = (
    element: IWorldElementWithChildren,
    parentId: number | null,
  ) => {
    if (element.parentId === parentId) return;
    const worldElementToUpdate: IWorldElement = {
      parentId: parentId,
      id: element.id,
      name: element.name,
      description: element.description,
      origin: element.origin,
      conflictCause: element.conflictCause,
      worldId: element.worldId,
    };
    dispatch(updateWorldElement(worldElementToUpdate));
  };

  const add = (id: number) => {
    dispatch(addWorldElement(id));
  };

  const rootElements = Object.values(worldElements).filter((el) => el.parentId === null);

  return (
    <div className="w-full px-4 py-4 bg-slate-50 dark:text-gray-50 dark:bg-slate-900 border-l rounded-br-md border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <h3 className="dark:text-gray-50 font-semibold text-sm text-gray-700">{t("title")}</h3>
        <Button
          data-testid="btn-add-world-element"
          aria-label={t("element.add")}
          variant="ghost"
          onClick={() => add(world.id)}
          size="sm"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
      {rootElements.map((el) => (
        <WorldElementNode
          worldElements={worldElements}
          key={el.id}
          element={el}
          depth={0}
          handleEnter={handleDragEnter}
          handleDragStart={handleDragStart}
          handleDrop={handleDrop}
          dispatch={dispatch}
          isDraggingOver={dragOverElement === el.id}
          currentWorldElement={currentWorldElement}
        ></WorldElementNode>
      ))}
      <div
        data-testid="ouside-element"
        onDrop={(e) => handleDrop(e, null)}
        onDragOver={handleDragOver}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragOverElement(0);
        }}
        className={cn(
          "p-2 mb-3 text-xs italic text-gray-500 min-h-10",
          dragOverElement === 0 && "bg-blue-100 dark:bg-blue-900",
        )}
      ></div>
    </div>
  );
};

export default WorldSidebar;
