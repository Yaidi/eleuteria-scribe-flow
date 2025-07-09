const isElectron = () => typeof window !== "undefined" && "electron" in window;

export const electron = isElectron() ? window.electron : null;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
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
