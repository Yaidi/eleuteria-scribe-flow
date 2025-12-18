import { app, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import "@/store/electron/main";
import path from "node:path";
import { spawn, ChildProcess } from "node:child_process";
import * as http from "node:http";
import { killPort } from "./utils.ts";
import "@/localizations/i18n.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const isSmokeTest = process.env.SMOKE_TEST === "true";
export const RENDERER_DIST =
  VITE_DEV_SERVER_URL || isSmokeTest
    ? path.join(process.env.APP_ROOT, "dist")
    : path.join(process.resourcesPath, "dist");

process.env.VITE_PUBLIC =
  VITE_DEV_SERVER_URL || isSmokeTest ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;

let win: BrowserWindow | null;
let splash: BrowserWindow | null = null;
let pythonBackendProcess: ChildProcess | null = null;
// let rustBackendProcess: ChildProcess | null = null; TODO: Backend en RUST Clausurado hasta nuevo aviso :v

function createWindow() {
  const preloadPath =
    app.isPackaged && !isSmokeTest
      ? path.join(process.resourcesPath, "preload.cjs")
      : path.join(__dirname, "preload.cjs");
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
  } else if (isSmokeTest) {
    console.log(RENDERER_DIST, "RENDERER_DIST");
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
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

  // Rust Backend TODO: Backend en RUST Clausurado hasta nuevo aviso :v
  /*
  const rustBackendPath =
    isDev || isSmokeTest ? "cargo" : path.join(process.resourcesPath, "backend-rust");

  const rustBackendArgs = isDev || isSmokeTest ? ["run"] : [];

  rustBackendProcess = spawn(rustBackendPath, rustBackendArgs, {
    cwd:
      isDev || isSmokeTest
        ? path.join(process.env.APP_ROOT, "backend-rust")
        : path.dirname(rustBackendPath),

    shell: false,
    stdio: ["ignore", "pipe", "pipe"],
  });

  rustBackendProcess.stdout?.on("data", (data) => {
    //if (rustBackendProcess?.killed) return;
    try {
      console.log(`[Rust Backend]: ${data.toString()}`);
    } catch (e) {
      console.log(`Rust Backend Process Exception: ${e}`);
    }
  });

  rustBackendProcess.stderr?.on("data", async (data) => {
    //if (rustBackendProcess?.killed) return;
    try {
      console.info(`[Rust Backend]: ${data.toString()}`);
    } catch (e) {
      console.error(`Rust Backend Process Exception: ${e}`);
    }
  });

  rustBackendProcess.on("close", async (code) => {
    //if (rustBackendProcess?.killed) return;
    console.log(`Rust server exited with code ${code}`);
  });
  */

  // Python Backend
  const pythonBackendPath =
    isDev || isSmokeTest
      ? path.join(process.env.APP_ROOT, "backend", ".venv", "bin", "uvicorn")
      : path.join(process.resourcesPath, "eleuteria-backend"); // Binario incluido en build

  const pythonBackendArgs =
    isDev || isSmokeTest ? ["backend.app.main:app", "--host", "127.0.0.1", "--port", "8000"] : []; // El binario PyInstaller ya corre el servidor

  pythonBackendProcess = spawn(pythonBackendPath, pythonBackendArgs, {
    cwd: isDev || isSmokeTest ? process.env.APP_ROOT : path.dirname(pythonBackendPath),
    shell: false, // ⚠️ más seguro en prod
    stdio: ["ignore", "pipe", "pipe"],
  });

  pythonBackendProcess.on("close", (code) => {
    console.log(`Backend process exited with code ${code}`);
    pythonBackendProcess = null;
  });

  pythonBackendProcess.stdout?.on("data", (data) => {
    console.log(`[Python Backend stdout]: ${data.toString()}`);
  });

  pythonBackendProcess.stderr?.on("data", (data) => {
    console.info(`[Python Backend stderr]: ${data.toString()}`);
  });
}

app.on("window-all-closed", async () => {
  const isCI = process.env.CI === "true";

  if (pythonBackendProcess) {
    pythonBackendProcess.kill();
    pythonBackendProcess = null;
    await killPort(8000);
  }
  /* TODO: Backend en RUST Clausurado hasta nuevo aviso :v
  if (rustBackendProcess) {
    rustBackendProcess.kill();
    rustBackendProcess = null;
    await killPort(9001);
  }
*/
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
  await killPort(8000);
  await killPort(9001);
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
  startBackend();

  try {
    await waitForBackend();
    // await waitForBackend("http://127.0.0.1:9001/"); // await for Rust backend TODO: Backend en RUST Clausurado hasta nuevo aviso :v
    splash?.close();
    splash = null;
    createWindow();
  } catch (err) {
    console.error("❌ El backend no arrancó:", err);
    splash?.close();
    app.quit();
  }
});
