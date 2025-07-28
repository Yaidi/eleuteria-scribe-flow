import React from "react";

export interface SidebarProps {
  children: React.ReactNode;
}
const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  return (
    <nav className="min-w-40 max-w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 p-4 h-full">
      <section className="flex flex-col space-y-2 mb-6 h-full w-full">{children}</section>
    </nav>
  );
};
export default Sidebar;
