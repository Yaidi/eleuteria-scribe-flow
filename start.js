import { fileURLToPath } from "node:url";
import { spawn, execSync } from "node:child_process";
import { setTimeout } from "node:timers/promises";
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

function killPort(port) {
  try {
    if (os.platform() === "darwin" || os.platform() === "linux") {
      const result = execSync(`lsof -ti tcp:${port}`).toString();
      const pids = result.split("\n").filter(Boolean);
      pids.forEach((pid) => {
        execSync(`kill -9 ${pid}`);
      });
    } else if (os.platform() === "win32") {
      const result = execSync(`netstat -ano | findstr :${port}`).toString();
      const lines = result.split("\n").filter(Boolean);
      const pids = new Set(lines.map((line) => line.trim().split(/\s+/).pop()));
      pids.forEach((pid) => {
        execSync(`taskkill /PID ${pid} /F`);
      });
    }
  } catch (err) {
    // eslint-disable-next-line no-undef
    console.error(`Error killing port ${port}:`, err.message);
  }
}

async function main() {
  try {
    const backendPath = path.join(__dirname, "backend");

    // Mata cualquier proceso en el puerto 8000
    killPort(8000);

    // Configurar Poetry para crear el entorno virtual en el proyecto
    await runCommand("poetry", ["config", "virtualenvs.in-project", "true"], {
      cwd: backendPath,
    });

    // Instalar dependencias con Poetry
    // eslint-disable-next-line no-undef
    console.log("Installing backend dependencies with Poetry...");
    await runCommand("poetry", ["install"], {
      cwd: backendPath,
    });

    // Arrancar backend usando Poetry desde el directorio raíz del proyecto
    // eslint-disable-next-line no-undef
    console.log("Starting backend with Poetry...");
    const backend = spawn(
      "poetry",
      [
        "run",
        "uvicorn",
        "backend.app.main:app",
        "--reload",
        "--host",
        "localhost",
        "--port",
        "8000",
      ],
      {
        shell: true,
        stdio: "inherit",
        cwd: __dirname, // Ejecutar desde el directorio raíz, no desde backend/
      },
    );

    backend.on("close", (code) => {
      // eslint-disable-next-line no-undef
      console.log(`Backend exited with code ${code}`);
    });

    // Esperar un poco para que el backend inicie
    await setTimeout(3000);

    // Arrancar frontend
    // eslint-disable-next-line no-undef
    console.log("Starting frontend...");
    await runCommand("npm", ["run", "dev"]);
  } catch (err) {
    // eslint-disable-next-line no-undef
    console.error("Error:", err);
  }
}

main();
