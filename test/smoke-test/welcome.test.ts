import { test, expect, afterAll, beforeAll } from "vitest";
import { _electron as electron, ElectronApplication, Page } from "playwright";

let app: ElectronApplication;
let page: Page;

beforeAll(async () => {
  app = await electron.launch({
    args: ["."],
    env: {
      ...process.env,
      ELECTRON_DISABLE_SECURITY_WARNINGS: "true",
    },
  });
  page = await app.firstWindow();
});

afterAll(async () => {
  if (app) {
    await app.close();
  }
});

test("la app se abre y muestra la ventana principal", async () => {
  const title = await page.title();
  expect(title).toMatch(/Eleuteria - Writing Studio/i);
});
