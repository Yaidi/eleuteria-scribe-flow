import { Button } from "@/components/ui/button.tsx";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import React from "react";

interface BackButtonProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ darkMode, toggleDarkMode }) => {
  const { t } = useTranslation("");
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center p-8">
      <Button
        role="navigation"
        data-testid="btn-back"
        aria-label={t("buttons.back")}
        variant="ghost"
        size="sm"
        onClick={() => navigate("/")}
        className="flex items-center space-x-2"
      >
        <ArrowLeft className="w-4 h-4" />
      </Button>
      <h2 className="text-lg m-2 font-semibold text-slate-800 dark:text-slate-200">Eleuteria</h2>
      <Button data-testid="btn-dark-mode" variant="ghost" size="sm" onClick={toggleDarkMode}>
        {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </Button>
    </div>
  );
};
export default BackButton;
