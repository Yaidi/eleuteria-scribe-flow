import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea.tsx";
import { IWorldElement } from "@/types/sections.ts";
import React from "react";
import { useTranslation } from "react-i18next";

interface FormWorldProps {
  currentWorldElement: IWorldElement;
  update: (arg0: IWorldElement) => void;
  remove: (arg0: number) => void;
}
const FormWorld: React.FC<FormWorldProps> = ({ currentWorldElement, update, remove }) => {
  const { t } = useTranslation("world");

  return (
    <div className="flex flex-col items-start w-full h-full gap-4">
      <div
        key={currentWorldElement.id}
        className="border rounded-lg p-4 flex flex-col items-start gap-4 w-full"
      >
        <Label htmlFor={`name-world-element`}>{t("element.name.label")}</Label>
        <Input
          id={`name-world-element`}
          name="title"
          value={currentWorldElement.name}
          onChange={(e) => update({ ...currentWorldElement, name: e.target.value })}
          placeholder={t("element.name.placeholder")}
        />
        <Label htmlFor="description-world-element">{t("element.description.name")}</Label>
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
          placeholder={t("element.name.placeholder")}
        />
      </div>
      <Button
        className="w-1/3 self-end"
        aria-label={t("element.delete")}
        data-testid={`btn-remove-world-el-${currentWorldElement.id}`}
        variant="destructive"
        size="sm"
        onClick={() => remove(currentWorldElement.id)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default FormWorld;
