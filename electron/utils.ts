import { exec } from "node:child_process";
import { promisify } from "node:util";
import os from "node:os";

const execAsync = promisify(exec);

export async function killPort(port: number): Promise<void> {
  try {
    if (os.platform() === "darwin" || os.platform() === "linux") {
      const { stdout } = await execAsync(`lsof -ti tcp:${port}`);
      const pids = stdout.split("\n").filter(Boolean);
      for (const pid of pids) {
        await execAsync(`kill -9 ${pid}`);
      }
    } else if (os.platform() === "win32") {
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      const lines = stdout.split("\n").filter(Boolean);
      const pids = new Set(lines.map((line) => line.trim().split(/\s+/).pop()));
      for (const pid of pids) {
        await execAsync(`taskkill /PID ${pid} /F`);
      }
    }
    console.log(`✅ Puerto ${port} liberado`);
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.includes("Command failed") || msg.includes("no such process")) {
      console.log(`ℹ️ No hay procesos en el puerto ${port}`);
    } else {
      console.error(`❌ Error killing port ${port}:`, msg);
    }
  }
}
