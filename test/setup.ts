import { spawn } from "node:child_process";
import path from "path";
import fs from "node:fs";

const APP_ROOT = path.join(__dirname, "..");
const VITE_PUBLIC = path.join(APP_ROOT, "public");

export const tempUserData = path.join(".playwright-temp", `user-data-${Date.now()}`);
fs.mkdirSync(tempUserData, { recursive: true });

export const electronProcess = spawn("npx", ["electron", "."], {
  env: {
    ...process.env,
    SMOKE_TEST: "true",
    APP_ROOT,
    VITE_PUBLIC,
    SMOKE_USER_DATA: tempUserData,
  },
  stdio: "inherit",
});
