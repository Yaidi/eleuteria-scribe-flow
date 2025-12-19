import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select.tsx";
import { useTranslation } from "react-i18next";

const Settings = () => {
  const { t, i18n } = useTranslation("settings");

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  return (
    <div
      data-testid="settings-page"
      className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900"
    >
      <main className="flex flex-col h-full p-4">
        <Select onValueChange={(e) => changeLanguage(e)}>
          <SelectTrigger>{t("changeLanguage")}</SelectTrigger>
          <SelectContent>
            {i18n.languages.map((language) => (
              <SelectItem key={`${language}`} value={language}>
                {t(`languages.${language}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </main>
    </div>
  );
};

export default Settings;
