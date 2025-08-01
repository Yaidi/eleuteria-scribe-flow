import { IPlot } from "@/types/sections.ts";
import React from "react";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@radix-ui/react-label";
import { Button } from "@/components/ui/button.tsx";
import { Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select.tsx";

export interface FormPlotsProps {
  currentPlot: IPlot;
  handleRemove: (arg0: number) => void;
  handleUpdate: (arg0: Partial<IPlot>) => void;
}

const FormPlots: React.FC<FormPlotsProps> = ({ currentPlot, handleRemove, handleUpdate }) => {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Label>Plot Title</Label>
          <Input
            data-testid={`input-plot-title-${currentPlot.id}`}
            name="title"
            value={currentPlot.title}
            onChange={(e) =>
              handleUpdate({
                id: currentPlot.id,
                title: e.target.value,
              })
            }
            placeholder="Plot title"
          />
        </div>
        <Button
          data-testid={`btn-remove-plot-${currentPlot.id}`}
          variant="destructive"
          size="sm"
          onClick={() => handleRemove(currentPlot.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-4">
        <div>
          <Label>Description</Label>
          <Textarea
            data-testid={`textarea-plot-description-${currentPlot.id}`}
            name="description"
            value={currentPlot.description}
            onChange={(e) =>
              handleUpdate({
                id: currentPlot.id,
                description: e.target.value,
              })
            }
            placeholder="Describe what happens in this plot..."
          />
        </div>
        {/*
                 <div>
                  <Label>Manuscript Reference</Label>
                  <Input
                    data-testid={`input-plot-reference-${plot.id}`}
                    name="chapterReference"
                    value={plot.chapterReferences?.join(", ")}
                    onChange={(e) =>
                      update({
                        id: plot.id,
                        chapterReferences: e.target.value.split(",").map((ref) => ref.trim()),
                      })
                    }
                    placeholder="Chapter/page reference where this plot occurs"
                  />
                </div>
                   */}
        <div>
          <Label>Characters Involved</Label>
          <Select name="characters" value="0" disabled={true}>
            <SelectTrigger></SelectTrigger>
            <SelectContent>
              {currentPlot.characters.map((character) => (
                <SelectItem key={`${character.name}-${currentPlot.title}`} value="0">
                  {character.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
export default FormPlots;
