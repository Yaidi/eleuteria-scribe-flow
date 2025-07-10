import { app, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import "@/store/electron/main";
import path from "node:path";
import { spawn, ChildProcess } from "node:child_process";
import * as http from "node:http";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");

// Env variables
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "dist")
  : path.join(process.resourcesPath, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;
let splash: BrowserWindow | null = null;
let backendProcess: ChildProcess | null = null;

function createWindow() {
  const preloadPath = app.isPackaged
    ? path.join(process.resourcesPath, "preload.cjs")
    : path.join(__dirname, "preload.cjs");

  console.log("📦 Usando preload:", preloadPath);
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC ?? "", "electron-vite.svg"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: preloadPath,
    },
  });

  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
function waitForBackend(
  url = "http://127.0.0.1:8000",
  timeout = 10000,
  interval = 300,
): Promise<void> {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(url, (res) => {
        if (res.statusCode && res.statusCode < 500) {
          resolve();
        } else {
          retry();
        }
      });

      req.on("error", retry);
      req.end();
    };

    const retry = () => {
      if (Date.now() - startTime > timeout) {
        reject(new Error("Backend not available after timeout"));
      } else {
        setTimeout(check, interval);
      }
    };

    check();
  });
}

function startBackend() {
  const isDev = !!VITE_DEV_SERVER_URL;

  const backendPath = isDev
    ? path.join(process.env.APP_ROOT, "backend", ".venv", "bin", "uvicorn")
    : path.join(process.resourcesPath, "eleuteria-backend"); // Binario incluido en build

  const backendArgs = isDev
    ? ["backend.app.main:app", "--host", "127.0.0.1", "--port", "8000"]
    : []; // El binario PyInstaller ya corre el servidor

  backendProcess = spawn(backendPath, backendArgs, {
    cwd: isDev ? process.env.APP_ROOT : path.dirname(backendPath),
    shell: false, // ⚠️ más seguro en prod
    stdio: ["ignore", "pipe", "pipe"],
  });

  backendProcess.on("close", (code) => {
    console.log(`Backend process exited with code ${code}`);
    backendProcess = null;
  });

  backendProcess.stdout?.on("data", (data) => {
    console.log(`[backend stdout]: ${data.toString()}`);
  });

  backendProcess.stderr?.on("data", (data) => {
    console.error(`[backend stderr]: ${data.toString()}`);
  });
}

app.on("window-all-closed", () => {
  const isCI = process.env.CI === "true";

  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }

  if (process.platform !== "darwin" || isCI) {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(async () => {
  startBackend();

  splash = new BrowserWindow({
    width: 300,
    height: 200,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    transparent: false,
    show: false,
  });

  await splash.loadFile(path.join(process.env.VITE_PUBLIC ?? "", "loading.html"));
  splash.once("ready-to-show", () => splash?.show());

  try {
    await waitForBackend();
    splash?.close();
    splash = null;
    createWindow();
  } catch (err) {
    console.error("❌ El backend no arrancó:", err);
    splash?.close();
    app.quit();
  }
});
