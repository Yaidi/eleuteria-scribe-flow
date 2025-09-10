import { IWorldElementWithChildren } from "@/types/sections.ts";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";
import React, { useState } from "react";
import { setCurrentWorldElement } from "@/store";
import { UnknownAction } from "@reduxjs/toolkit";

export interface WorldElementNodeProps {
  worldElements: Record<number, IWorldElementWithChildren>;
  element: IWorldElementWithChildren;
  depth: number;
  handleDragStart: (
    e: React.DragEvent<HTMLButtonElement>,
    elementId: number,
    setSelectedElement: (arg0: number) => void,
  ) => void;
  handleDrop: (
    e: React.DragEvent<HTMLDivElement | HTMLButtonElement>,
    parentId: number | null,
  ) => void;
  handleEnter: (elementId: number) => void;
  dispatch: React.Dispatch<UnknownAction>;
  isDraggingOver?: boolean;
}
const WorldElementNode: React.FC<WorldElementNodeProps> = ({
  worldElements,
  element,
  depth,
  handleDragStart,
  handleDrop,
  handleEnter,
  dispatch,
  isDraggingOver = true,
}) => {
  const [selectedElement, setSelectedElement] = useState<number | null>(null);

  return (
    <div className="ml-4" data-testid={`node-${element.id}`}>
      <Button
        draggable
        onDragEnd={() => setSelectedElement(null)}
        onDragStart={(e) => handleDragStart(e, element.id, setSelectedElement)}
        onClick={() => dispatch(setCurrentWorldElement(element))}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={(e) => {
          e.preventDefault();
          handleEnter(element.id);
        }}
        onDrop={(e) => {
          // Just makes to avoid nesting more than 2 levels
          if (depth < 2) handleDrop(e, element.id);
        }}
        variant="ghost"
        size="default"
        className={cn(
          "w-full justify-start h-7 px-2 text-xs cursor-move transition-colors",
          selectedElement === element.id && "opacity-50",
          isDraggingOver && "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
        )}
      >
        {element.name}
      </Button>
      {element.childrenIds.length > 0 && (
        <div className="ml-4">
          {element.childrenIds.map((childId) => (
            <WorldElementNode
              key={childId}
              worldElements={worldElements}
              element={worldElements[childId]}
              depth={depth + 1}
              handleEnter={handleEnter}
              handleDragStart={handleDragStart}
              handleDrop={handleDrop}
              dispatch={dispatch}
              isDraggingOver={isDraggingOver}
            />
          ))}
        </div>
      )}
    </div>
  );
};
export default WorldElementNode;
