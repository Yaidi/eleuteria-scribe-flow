import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { _electron as electron, ElectronApplication, Page } from "playwright";

let app: ElectronApplication;
let page: Page;
let splash: Page;

beforeAll(async () => {
  app = await electron.launch({
    args: ["."],
    env: {
      ...process.env,
      SMOKE_TEST: "true",
    },
  });
  splash = await app.firstWindow();
});

afterAll(async () => {
  await app.close();
});

describe("Welcome Screen Tests", () => {
  test("should show loading", async () => {
    const title = await splash.title();
    expect(title).toMatch(/Cargando.../i);
    const heading = await splash.getByRole("heading", { name: /Iniciando Eleuteria/i }).isVisible();
    expect(heading).toBeTruthy();
  });

  test("should welcome page", async () => {
    page = await app.waitForEvent("window");
    const welcomeTitle = await page.title();
    expect(welcomeTitle).toMatch(/Eleuteria - Writing Studio/i);
    const heading = await page.getByRole("heading", { name: /Eleuteria/i }).isVisible();
    expect(heading).toBeTruthy();
    await page.getByRole("button", { name: /Novel/i }).click();
    const selectedTemplate = await page
      .getByRole("heading", { name: /Novel Template/i })
      .isVisible();
    expect(selectedTemplate).toBeTruthy();
    await page.getByRole("button", { name: /Choose This Template/i }).click();
  });

  test("should display main content", async () => {
    await page.waitForSelector("h2");
    const buttonGeneral = await page.getByRole("button", { name: /General/i }).isVisible();
    expect(buttonGeneral).toBeTruthy();
  });

  test("should display characters content", async () => {
    await page.getByRole("button", { name: /Characters/i }).click();
    await page.getByTestId("character-section-title").isVisible();
    await page.getByRole("button", { name: /Add Character/i }).click();
    await page.getByTestId("character-form").isVisible();
    await page.getByPlaceholder("Character name").fill("Yaidi");
    const inputName = await page.getByPlaceholder("Character name").inputValue();
    expect(inputName).toBe("Yaidi");
  });
});
