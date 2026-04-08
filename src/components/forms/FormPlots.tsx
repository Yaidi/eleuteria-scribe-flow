import { IPlot } from "@/types/sections.ts";
import React from "react";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@radix-ui/react-label";
import { Button } from "@/components/ui/button.tsx";
import { Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select.tsx";
import { useTranslation } from "react-i18next";
import { useSections } from "@/hooks/useSections.ts";

export interface FormPlotsProps {
  currentPlot: IPlot;
  handleRemove: (arg0: number) => void;
  handleUpdate: (arg0: Partial<IPlot>) => void;
}

const FormPlots: React.FC<FormPlotsProps> = ({ currentPlot, handleRemove, handleUpdate }) => {
  const { t } = useTranslation("plots");
  const { characters } = useSections().characters;

  return (
    <div className="flex flex-col items-start w-full border rounded-lg p-4 gap-y-2">
      <Label>{t("plot.title.name")}</Label>
      <Input
        data-testid={`input-plot-title-${currentPlot.id}`}
        name="title"
        value={currentPlot.title ?? ""}
        onChange={(e) =>
          handleUpdate({
            id: currentPlot.id,
            title: e.target.value,
          })
        }
        placeholder={t("plot.title.placeholder")}
      />
      <Label>{t("plot.description.name")}</Label>
      <Textarea
        data-testid={`textarea-plot-description-${currentPlot.id}`}
        name="description"
        value={currentPlot.description ?? ""}
        onChange={(e) =>
          handleUpdate({
            id: currentPlot.id,
            description: e.target.value,
          })
        }
        placeholder={t("plot.description.placeholder")}
      />
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
      <Label>{t("plot.charactersInvolved")}</Label>
      <Select name="characters" onValueChange={(e) => e}>
        <SelectTrigger>Anade un personaje</SelectTrigger>
        <SelectContent>
          {characters.map((character) => (
            <SelectItem
              key={`${character.name}-${currentPlot.title}`}
              value={character.id.toString()}
            >
              {character.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <section>
        {currentPlot.characters.map((character) => (
          <article key={`${character.name}-${currentPlot.title}`}>{character.name}</article>
        ))}
      </section>
      <Button
        data-testid={`btn-remove-plot-${currentPlot.id}`}
        variant="destructive"
        size="sm"
        onClick={() => handleRemove(currentPlot.id)}
        className="w-1/3 self-end"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};
export default FormPlots;
