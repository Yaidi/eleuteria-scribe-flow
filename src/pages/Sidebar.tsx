import { Button } from "@/components/ui/button";
import {ESections} from "@/types/sections.tsx";
import React from "react";
import {useSelector} from "react-redux";
import {RootState} from "@/store/config.tsx";

interface SidebarProps {
    activeSection: ESections;
}

const Sidebar: React.FC<SidebarProps> = ({activeSection}) => {
    const { characters } = useSelector((state: RootState) => state.sections);

    switch (activeSection) {
      case ESections.Characters:
          return(<div className="space-y-2 bg-slate-50 dark:bg-slate-900 border-r rounded-t-sm border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm text-gray-700">Characters</h3>
              </div>

              {['Principal', 'Secondary', 'Minor'].map((role) => (
                  <div key={role} className="space-y-1">
                      <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                          {role}
                      </h4>
                      {characters
                          .filter(char => char.importance === role.toLowerCase())
                          .map((character) => (
                              <Button
                                  key={character.id}
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start h-7 px-2 text-xs"
                              >
                                  <div
                                      className="w-3 h-3 rounded-full mr-2"
                                  />
                                  {character.name}
                              </Button>
                          ))}
                  </div>
              ))}
          </div>)
      default:
          return (<div></div>)
  }
}

export default Sidebar;