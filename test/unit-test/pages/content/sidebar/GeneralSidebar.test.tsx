import { screen, fireEvent } from "@testing-library/react";
import { vi, expect, describe, test, beforeEach } from "vitest";
import { setCurrentGeneral } from "@/store";
import { renderWithProviders } from "../../../../utils/renderWithProviders.tsx";
import { GeneralSections } from "@/types/sections.ts";
import GeneralSidebar from "@/pages/content/sidebar/GeneralSidebar.tsx";
import { store } from "@/store/config.ts";

const mockDispatch = vi.fn();
vi.mock("react-redux", async () => {
  const actual = await vi.importActual("react-redux");
  return {
    ...actual,
    useDispatch: () => mockDispatch,
  };
});

describe("GeneralSidebar component", () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  test("renders the sidebar with all elements", () => {
    renderWithProviders(<GeneralSidebar />);

    expect(screen.getByTestId("general-section-title")).toBeInTheDocument();
    expect(screen.getByText("information")).toBeInTheDocument();
  });

  test("renders all three buttons", () => {
    renderWithProviders(<GeneralSidebar />);

    expect(screen.getByTestId("general-book")).toBeInTheDocument();
    expect(screen.getByTestId("goals")).toBeInTheDocument();
    expect(screen.getByTestId("statistics")).toBeInTheDocument();
  });

  test("renders buttons with correct labels", () => {
    renderWithProviders(<GeneralSidebar />);

    expect(screen.getByText("aboutBook")).toBeInTheDocument();
    expect(screen.getByText("Goals")).toBeInTheDocument();
    expect(screen.getByText("statistics.title")).toBeInTheDocument();
  });

  test("dispatches setCurrentGeneral with bookInfo when book button is clicked", () => {
    renderWithProviders(<GeneralSidebar />);

    const bookButton = screen.getByTestId("general-book");
    fireEvent.click(bookButton);

    expect(mockDispatch).toHaveBeenCalledWith(setCurrentGeneral(GeneralSections.bookInfo));
  });

  test("dispatches setCurrentGeneral with goals when goals button is clicked", () => {
    renderWithProviders(<GeneralSidebar />);

    const goalsButton = screen.getByTestId("goals");
    fireEvent.click(goalsButton);

    expect(mockDispatch).toHaveBeenCalledWith(setCurrentGeneral(GeneralSections.goals));
  });

  test("dispatches setCurrentGeneral with statistics when statistics button is clicked", () => {
    renderWithProviders(<GeneralSidebar />);

    const statisticsButton = screen.getByTestId("statistics");
    fireEvent.click(statisticsButton);

    expect(mockDispatch).toHaveBeenCalledWith(setCurrentGeneral(GeneralSections.statistics));
  });

  test("highlights the active section button", () => {
    renderWithProviders(<GeneralSidebar />, {
      project: {
        ...store.getState().project,
        sections: {
          ...store.getState().project.sections,
          general: {
            ...store.getState().project.sections.general,
            currentGeneralSection: GeneralSections.bookInfo,
          },
        },
      },
    });

    const bookButton = screen.getByTestId("general-book");
    expect(bookButton).toHaveClass("bg-slate-200");
  });

  test("highlights goals button when goals section is active", () => {
    renderWithProviders(<GeneralSidebar />, {
      project: {
        ...store.getState().project,
        sections: {
          ...store.getState().project.sections,
          general: {
            ...store.getState().project.sections.general,
            currentGeneralSection: GeneralSections.goals,
          },
        },
      },
    });

    const goalsButton = screen.getByTestId("goals");
    expect(goalsButton).toHaveClass("bg-slate-200");
  });

  test("highlights statistics button when statistics section is active", () => {
    renderWithProviders(<GeneralSidebar />, {
      project: {
        ...store.getState().project,
        sections: {
          ...store.getState().project.sections,
          general: {
            ...store.getState().project.sections.general,
            currentGeneralSection: GeneralSections.statistics,
          },
        },
      },
    });

    const statisticsButton = screen.getByTestId("statistics");
    expect(statisticsButton).toHaveClass("bg-slate-200");
  });

  test("has proper CSS classes for styling", () => {
    renderWithProviders(<GeneralSidebar />);

    const container = screen.getByTestId("general-section-title").closest("div");
    expect(container).toHaveClass("flex", "flex-col", "w-full", "h-full");
  });

  test("renders with correct button styling", () => {
    renderWithProviders(<GeneralSidebar />);

    const bookButton = screen.getByTestId("general-book");
    expect(bookButton).toHaveClass("w-full", "justify-start", "h-auto", "px-2", "py-4");
  });

  test("does not highlight other buttons when one is active", () => {
    renderWithProviders(<GeneralSidebar />, {
      project: {
        ...store.getState().project,
        sections: {
          ...store.getState().project.sections,
          general: {
            ...store.getState().project.sections.general,
            currentGeneralSection: GeneralSections.bookInfo,
          },
        },
      },
    });

    const goalsButton = screen.getByTestId("goals");
    const statisticsButton = screen.getByTestId("statistics");

    expect(goalsButton).not.toHaveClass("bg-slate-200");
    expect(statisticsButton).not.toHaveClass("bg-slate-200");
  });

  test("renders buttons with icon and text content", () => {
    renderWithProviders(<GeneralSidebar />);

    const bookButton = screen.getByTestId("general-book");
    expect(bookButton.querySelector("svg")).toBeInTheDocument();
    expect(bookButton.querySelector("span")).toBeInTheDocument();
  });

  test("all buttons are clickable and not disabled", () => {
    renderWithProviders(<GeneralSidebar />);

    const bookButton = screen.getByTestId("general-book") as HTMLButtonElement;
    const goalsButton = screen.getByTestId("goals") as HTMLButtonElement;
    const statisticsButton = screen.getByTestId("statistics") as HTMLButtonElement;

    expect(bookButton.disabled).toBe(false);
    expect(goalsButton.disabled).toBe(false);
    expect(statisticsButton.disabled).toBe(false);
  });
});
