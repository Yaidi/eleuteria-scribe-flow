import { execSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import process from "process";

const platform = os.platform();
const home = os.homedir();
const poetryBinPath = path.join(home, ".local", "bin");

function runCommand(command, options = {}) {
  try {
    execSync(command, { stdio: "inherit", ...options });
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error(`❌ Error running: ${command}`);
    // eslint-disable-next-line no-undef
    console.error(error.message);
    process.exit(1);
  }
}

function installPoetryUnix() {
  // eslint-disable-next-line no-undef
  console.log("📦 Installing Poetry on macOS/Linux...");
  runCommand("curl -sSL https://install.python-poetry.org | python3 -");

  const shell = process.env.SHELL || "";
  const zshrc = path.join(home, ".zshrc");
  const bashrc = path.join(home, ".bashrc");

  const pathLine = `export PATH="${poetryBinPath}:$PATH"`;

  function addToShellConfig(file) {
    if (!fs.existsSync(file)) return;
    const content = fs.readFileSync(file, "utf8");
    if (!content.includes(pathLine)) {
      fs.appendFileSync(file, `\n${pathLine}\n`);
      // eslint-disable-next-line no-undef
      console.log(`✅ Added Poetry to PATH in ${file}`);
    }
  }

  if (shell.includes("zsh")) {
    addToShellConfig(zshrc);
  } else if (shell.includes("bash")) {
    addToShellConfig(bashrc);
  }

  // Apply for current session
  process.env.PATH = `${poetryBinPath}:${process.env.PATH}`;
}

function installPoetryWindows() {
  // eslint-disable-next-line no-undef
  console.log("📦 Installing Poetry on Windows...");

  let pythonCmd = "python";
  try {
    execSync("python --version", { stdio: "ignore" });
  } catch {
    pythonCmd = "py";
  }

  const installScript = execSync("curl -sSL https://install.python-poetry.org").toString();
  const tempScriptPath = path.join(os.tmpdir(), "install-poetry.py");
  fs.writeFileSync(tempScriptPath, installScript);
  runCommand(`${pythonCmd} "${tempScriptPath}"`);
  fs.unlinkSync(tempScriptPath);

  const poetryPath = `${home}\\.local\\bin`;
  const currentPath = process.env["PATH"] || "";

  if (!currentPath.includes(poetryPath)) {
    const setEnvCmd = `[Environment]::SetEnvironmentVariable("Path", "$env:Path;$poetryPath", "User")`;
    runCommand(`powershell -Command "${setEnvCmd}"`);
    // eslint-disable-next-line no-undef
    console.log(`✅ Added Poetry to PATH in environment variables`);
  }

  // For current session
  process.env.PATH = `${poetryPath};${process.env.PATH}`;
}

function ensurePoetryInstalled() {
  try {
    execSync("poetry --version", { stdio: "ignore" });
    // eslint-disable-next-line no-undef
    console.log("✅ Poetry is already installed");
  } catch {
    if (platform === "win32") {
      installPoetryWindows();
    } else {
      installPoetryUnix();
    }
  }
}

function main() {
  // eslint-disable-next-line no-undef
  console.log(`🚀 Setting up Poetry for ${platform === "win32" ? "Windows" : "macOS/Linux"}...\n`);
  ensurePoetryInstalled();
  // eslint-disable-next-line no-undef
  console.log(`
  
  🎉 Setup completed successfully!
  
  ⚠️ Please open a new Terminal or PowerShell instance to run: npm run start
  
`);
}

main();
