import { createAsyncThunk } from "@reduxjs/toolkit";
import { Scene, IChapter } from "@/types/sections";
import { addChapter } from "@/store";
import { useProjectId } from "@/hooks/useSections.ts";
import { host } from "@/https/fetch.ts";
import { ManuscriptListResponse } from "@/types/requests.ts";
import { getManuscriptListFromStore, setManuscriptListToStore } from "@/store/electron/actions.ts";

/**
 * Guarda la escena editada en el backend.
 *   – Inicia o re-utiliza una sesión de guardado.
 *   – Envía el contenido por chunks.
 *   – Finaliza la sesión.
 */

export interface SaveSceneArgs {
  scene: Scene;
  chapter: IChapter;
  projectId: number;
}

export const getManuscriptList = createAsyncThunk<
  ManuscriptListResponse,
  number,
  { rejectValue: string }
>("Section [Manuscript] Get Manuscript List", async (projectId: number, { rejectWithValue }) => {
  const storedManuscriptListResponse = await getManuscriptListFromStore(projectId);

  if (storedManuscriptListResponse) {
    return storedManuscriptListResponse;
  }

  const response = await fetch(`${host}/manuscript/list/${projectId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return rejectWithValue("Failed to retrieve manuscript list");
  }

  const manuscriptList = (await response.json()) as ManuscriptListResponse;
  await setManuscriptListToStore(projectId, manuscriptList);

  return manuscriptList;
});

export const saveSceneSession = createAsyncThunk<
  { lastSaved: Date }, // payload de éxito
  SaveSceneArgs, // argumento recibido
  { rejectValue: string }
>("Section [Manuscript] Save Scene", async ({ scene, chapter, projectId }, { rejectWithValue }) => {
  try {
    const filename = `${scene.title}.md`;
    const relativePath = chapter.title;

    const session = await startSaveSession(filename, relativePath, projectId);

    await saveChunkToServer(scene.content, session, filename, relativePath);
    await finishSaveSession(session);
    return { lastSaved: new Date() };
  } catch (err) {
    console.error(err);
    return rejectWithValue("Failed to save scene x.x");
  }
});

const saveChunkToServer = async (
  contentToSave: string,
  sessionId: string,
  filename: string,
  relativePath: string,
) => {
  const formData = new FormData();
  const blob = new Blob([contentToSave], { type: "text/markdown" });
  formData.append("file", blob, filename);
  formData.append("relative_path", relativePath);

  await fetch(`${host}/manuscript/save/chunk/${sessionId}`, {
    method: "POST",
    body: formData,
  });
};

const startSaveSession = async (filename: string, relativePath: string, projectId: number) => {
  const res = await fetch(`${host}/manuscript/save/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      project_id: projectId,
      relative_path: relativePath,
      filename: filename,
    }),
  });

  const data = await res.json();
  return data.session_id;
};

const finishSaveSession = async (sessionId: string) => {
  const response = await fetch(`${host}/manuscript/save/finish/${sessionId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to finish save session: ${response.statusText}`);
  }

  return await response.json();
};

export const addChapterAndSaveScene = createAsyncThunk(
  "Section [Manuscript] Add Chapter and Save Scene",
  async (chapter: IChapter, { dispatch }) => {
    // Primero agregar el capítulo
    dispatch(addChapter(chapter));

    const projectId = useProjectId();

    const saveArgs: SaveSceneArgs = {
      scene: chapter.scenes[0],
      chapter: chapter,
      projectId: projectId,
    };

    return dispatch(saveSceneSession(saveArgs));
  },
);
