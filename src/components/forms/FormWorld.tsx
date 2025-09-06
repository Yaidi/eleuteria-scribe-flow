import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea.tsx";
import { IWorldElement } from "@/types/sections.ts";
import React from "react";

interface FormWorldProps {
  currentWorldElement: IWorldElement;
  update: (arg0: IWorldElement) => void;
  remove: (arg0: number) => void;
}
const FormWorld: React.FC<FormWorldProps> = ({ currentWorldElement, update, remove }) => {
  return (
    <div className="space-y-6">
      <div key={currentWorldElement.id} className="border rounded-lg p-4">
        <div className="flex justify-between items-start mb-4">
          <div className="grid grid-cols-2 gap-4 flex-1">
            <div>
              <Label htmlFor={`name-world-element`}>Name</Label>
              <Input
                id={`name-world-element`}
                name="title"
                value={currentWorldElement.name}
                onChange={(e) => update({ ...currentWorldElement, name: e.target.value })}
                placeholder="Element title"
              />
            </div>
          </div>
          <Button
            data-testid={`btn-remove-world-el-${currentWorldElement.id}`}
            variant="destructive"
            size="sm"
            onClick={() => remove(currentWorldElement.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        <div>
          <Label htmlFor="description-world-element">Description</Label>
          <Textarea
            id="description-world-element"
            name="description"
            value={currentWorldElement.description}
            onChange={(e) =>
              update({
                ...currentWorldElement,
                description: e.target.value,
              })
            }
            placeholder="Describe this world element in detail..."
          />
        </div>
      </div>
    </div>
  );
};

export default FormWorld;
