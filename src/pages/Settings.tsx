import AutoSave from "@/components/AutoSave.tsx";

const Settings = () => {
  return (
    <div
      data-testid="settings-page"
      className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900"
    >
      <p className="p-4">This is the settings page where users can adjust their preferences.</p>
      <main className="flex flex-col h-full p-4">
        <AutoSave />
      </main>
    </div>
  );
};

export default Settings;
