import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/config.ts";
import { ISectionsReducer } from "@/store/sections/sections-config.ts";
import { IManuscriptReducer } from "@/store/sections/manuscript/reducer.ts";
import { SaveSceneArgs, saveSceneSession } from "@/store";
import { useCallback } from "react";

export const useSections = (): ISectionsReducer => {
  return useSelector((state: RootState) => state.project.sections);
};

export const useProjectId = (): number => {
  return useSelector((state: RootState) => state.project.currentProject?.id || 0);
};

export const useManuscript = (): IManuscriptReducer => {
  return useSelector((state: RootState) => state.project.sections.manuscript);
};

export const useSaveScene = () => {
  const projectId = useProjectId();
  const dispatch = useDispatch<AppDispatch>();
  const manuscriptState = useManuscript();

  return useCallback(
    (newContent: string) => {
      if (!manuscriptState.currentScene || !manuscriptState.currentChapter) {
        console.warn("Chapter and scene not selected");
        return;
      }

      const newScene = {
        ...manuscriptState.currentScene,
        content: newContent,
      };

      const args: SaveSceneArgs = {
        scene: newScene,
        chapter: manuscriptState.currentChapter,
        projectId: projectId,
      };

      dispatch(saveSceneSession(args));
    },
    [projectId, dispatch, manuscriptState],
  );
};
