import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent, { PointerEventsCheckLevel } from "@testing-library/user-event";
import Settings from "@/pages/sections/Settings.tsx";

// Mock useTranslation to control t and i18n.changeLanguage
let changeLanguageMock = vi.fn();
vi.mock("react-i18next", async () => {
  const actual = await vi.importActual<typeof import("react-i18next")>("react-i18next");

  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => {
        const map: Record<string, string> = {
          changeLanguage: "Change language",
          "languages.en": "English",
          "languages.es": "Spanish",
        };
        return map[key] ?? key;
      },
      i18n: {
        languages: ["en", "es"],
        changeLanguage: (...args: never[]) => changeLanguageMock(...args),
      },
    }),
  };
});

describe("<Settings />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    changeLanguageMock = vi.fn();
  });

  test("renders settings page and trigger", () => {
    render(<Settings />);

    expect(screen.getByTestId("settings-page")).toBeInTheDocument();
    expect(screen.getByText("Change language")).toBeInTheDocument();
  });

  test("calls changeLanguage when selecting a language", async () => {
    render(<Settings />);
    const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });

    const trigger = screen.getByText("Change language");
    await user.click(trigger);

    const option = await screen.findByRole("option", { name: "English" });
    await user.click(option);

    expect(changeLanguageMock).toHaveBeenCalledWith("en");
  });
});
