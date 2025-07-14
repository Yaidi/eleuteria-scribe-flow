import { fileURLToPath } from "node:url";
import { spawn, execSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { stdio: "inherit", shell: true, ...options });
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

export function killPort(port) {
  try {
    if (os.platform() === "darwin" || os.platform() === "linux") {
      const result = execSync(`lsof -ti tcp:${port}`, {
        stdio: ["pipe", "pipe", "ignore"],
      }).toString();
      const pids = result.split("\n").filter(Boolean);
      pids.forEach((pid) => {
        execSync(`kill -9 ${pid}`);
      });
    } else if (os.platform() === "win32") {
      const result = execSync(`netstat -ano | findstr :${port}`, {
        stdio: ["pipe", "pipe", "ignore"],
      }).toString();
      const lines = result.split("\n").filter(Boolean);
      const pids = new Set(lines.map((line) => line.trim().split(/\s+/).pop()));
      pids.forEach((pid) => {
        execSync(`taskkill /PID ${pid} /F`);
      });
    }
  } catch (err) {
    if (err.message.includes("Command failed") || err.message.includes("no such process")) {
      // eslint-disable-next-line no-undef
      console.log(`ℹ️ No hay procesos en el puerto ${port}`);
    } else {
      // eslint-disable-next-line no-undef
      console.error(`Error killing port ${port}:`, err.message);
    }
  }
}

async function main() {
  try {
    const venvPath = path.join(__dirname, "backend", ".venv");
    const uvicornPath =
      os.platform() === "win32"
        ? path.join(venvPath, "Scripts", "uvicorn.exe")
        : path.join(venvPath, "bin", "uvicorn");

    const pythonPath = os.platform() === "win32" ? "python" : "python3";
    const pipPath =
      os.platform() === "win32"
        ? path.join(venvPath, "Scripts", "pip.exe")
        : path.join(venvPath, "bin", "pip");

    // Mata cualquier proceso en el puerto 8000
    killPort(8000);

    // Crear venv e instalar deps
    await runCommand(pythonPath, ["-m", "venv", venvPath]);
    await runCommand(pipPath, ["install", "--upgrade", "pip"]);
    await runCommand(pipPath, ["install", "-r", "backend/requirements-dev.txt"]);

    // Arrancar backend
    const backend = spawn(
      uvicornPath,
      ["backend.app.main:app", "--reload", "--host", "localhost", "--port", "8000"],
      {
        shell: true,
        stdio: "inherit",
      },
    );

    backend.on("close", (code) => {
      // eslint-disable-next-line no-undef
      console.log(`Backend exited with code ${code}`);
    });

    // Arrancar frontend
    await runCommand("npm", ["run", "dev"]);
  } catch (err) {
    // eslint-disable-next-line no-undef
    console.error("Error:", err);
  }
}

main();
