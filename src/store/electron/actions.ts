export const isElectron = () => typeof window !== "undefined" && "electron" in window;

const electron = isElectron() ? window.electron : null;

export const getCurrentId: () => Promise<number> = async () => {
  if (electron) {
    return await window.electron.ipcRenderer.invoke("get-project-id");
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
