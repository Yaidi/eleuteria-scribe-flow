import { Card } from "@/components/ui/card";
import FormsCharacters from "@/components/forms/FormsCharacters.tsx";
import { useProjectId, useSections } from "@/hooks/useSections.ts";
import { useTranslation } from "react-i18next";

const Characters = () => {
  const { t } = useTranslation("characters");

  const { characters, currentCharacter } = useSections().characters;
  const projectId = useProjectId();

  if (!projectId || !currentCharacter) return null;

  return (
    <Card>
      {characters.length === 0 && (
        <p className="text-center py-8 text-slate-500">{t("noCharacters")}</p>
      )}
      {currentCharacter && <FormsCharacters character={currentCharacter} />}
    </Card>
  );
};

export default Characters;
