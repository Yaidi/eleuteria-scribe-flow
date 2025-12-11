import { cn } from "@/lib/utils.ts";
import { updateWorldElement } from "@/store";
import React, { useState } from "react";
import { AppDispatch } from "@/store/config.ts";
import { useDispatch } from "react-redux";
import { useSections } from "@/hooks/useSections.ts";
import { IWorldElement, IWorldElementWithChildren } from "@/types/sections.ts";
import WorldElementNode from "@/components/world/WorldElementNode.tsx";
import { useTranslation } from "react-i18next";

const WorldSidebar = () => {
  const { t } = useTranslation("world");

  const { worldElements } = useSections().world;
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

  const rootElements = Object.values(worldElements).filter((el) => el.parentId === null);

  return (
    <div className="space-y-2 bg-slate-50 dark:text-gray-50 dark:bg-slate-900 border-r border-t rounded-br-md border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="dark:text-gray-50 font-semibold text-sm text-gray-700">{t("title")}</h3>
      </div>
      <div
        onDrop={(e) => handleDrop(e, null)}
        onDragOver={handleDragOver}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragOverElement(0); // usamos 0 como "fake root" en UI
        }}
        className={cn(
          "p-2 border rounded-md mb-3 text-xs italic text-gray-500",
          dragOverElement === 0 && "bg-green-100 dark:bg-green-900",
        )}
      ></div>
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
        ></WorldElementNode>
      ))}
    </div>
  );
};

export default WorldSidebar;
