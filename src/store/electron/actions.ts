import { ManuscriptListResponse } from "@/types/requests.ts";

export const isElectron = () => typeof window !== "undefined" && "electron" in window;

export const electron = isElectron() ? window.electron : null;

export const getCurrentId = async () => {
  if (electron) {
    const result = await window.electron.ipcRenderer.invoke("get-project-id");
    return Number(result) || 0;
  } else {
    return Number(localStorage.getItem("projectId")) || 0;
  }
};

export const setCurrentId = async (id: number) => {
  if (electron) {
    await window.electron.ipcRenderer.invoke("set-project-id", id);
  } else {
    localStorage.setItem("projectId", id.toString());
  }
};

export const getManuscriptListFromStore = async (
  projectId: number,
): Promise<ManuscriptListResponse | null> => {
  if (electron) {
    const result = (await window.electron.ipcRenderer.invoke(
      "get-manuscript-data",
      projectId,
    )) as ManuscriptListResponse;
    return result || null;
  } else {
    const data = localStorage.getItem(`manuscript-${projectId}`);
    return data ? JSON.parse(data) : null;
  }
};

export const setManuscriptListToStore = async (
  projectId: number,
  manuscriptData: ManuscriptListResponse,
) => {
  if (electron) {
    await window.electron.ipcRenderer.invoke("set-manuscript-data", projectId, manuscriptData);
  } else {
    localStorage.setItem(`manuscript-${projectId}`, JSON.stringify(manuscriptData));
  }
};
