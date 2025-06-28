import { Button } from "@/components/ui/button.tsx";
import { useState } from "react";

const AutoSave = () => {
  const [autoSave, setAutoSave] = useState(true);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setAutoSave(!autoSave)}
      className={`w-8 h-4 rounded-full transition-colors flex ${
        autoSave ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-600"
      }`}
    >
      <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600 dark:text-slate-400">Auto-save</span>
          <div
            className={`w-3 h-3 bg-white rounded-full transition-transform ${
              autoSave ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </div>
      </div>
    </Button>
  );
};
export default AutoSave;
