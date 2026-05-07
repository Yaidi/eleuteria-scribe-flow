import { useTranslation } from "react-i18next";

const LoadingProject = () => {
  const { t } = useTranslation();

  return (
    <section className="h-screen flex items-center justify-center">
      <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
        {t("loading.loading_project")}
      </p>
    </section>
  );
};
export default LoadingProject;
