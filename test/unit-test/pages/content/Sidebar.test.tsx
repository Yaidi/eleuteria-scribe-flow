import { screen, fireEvent } from "@testing-library/react";
import { ESections, ICharacter, IPlot, PriorityType } from "@/types/sections";
import { vi, expect, describe, test } from "vitest";
import { setCurrentCharacter, setCurrentPlot, updateCharacter, updatePlot } from "@/store";
import { renderWithProviders } from "../../../utils/renderWithProviders.tsx";
import { mockChapters, mockCharacters, mockPlots } from "../../../mocks";
import Sidebar from "@/pages/content/Sidebar.tsx";
import { store } from "@/store/config.ts";
import { mockThunkSuccess } from "../../../utils/mockThunkSuccess.ts";
import * as asyncActions from "@/store";

const mockDispatch = vi.fn();
vi.mock("react-redux", async () => {
  const actual = await vi.importActual("react-redux");
  return {
    ...actual,
    useDispatch: () => mockDispatch,
  };
});

mockThunkSuccess<ICharacter>(asyncActions, "updateCharacter", mockCharacters[0]);
mockThunkSuccess<IPlot>(asyncActions, "updatePlot", mockPlots[0]);

describe("Sidebar component", () => {
  test("renders empty div", () => {
    renderWithProviders(<Sidebar activeSection={ESections.Any} />);
    expect(screen.getByTestId("default")).toBeInTheDocument();
  });
  describe("Sidebar Plots", () => {
    test("set current Plot", () => {
      renderWithProviders(<Sidebar activeSection={ESections.plots} />, {
        sections: {
          ...store.getState().sections,
          plots: {
            plots: mockPlots,
            currentPlot: null,
          },
        },
      });
      fireEvent.click(screen.getByText("The Main Mystery"));
      expect(mockDispatch).toHaveBeenCalledWith(setCurrentPlot(mockPlots[0]));
    });

    test("dispatches updatePlot on drop", () => {
      renderWithProviders(<Sidebar activeSection={ESections.plots} />, {
        sections: {
          ...store.getState().sections,
          plots: {
            plots: mockPlots,
            currentPlot: null,
          },
        },
      });

      const dropZone = screen.getByText("Main").closest("div")!;
      const draggable = screen.getByText("The Main Mystery");

      const mockDataTransfer = {
        getData: vi.fn().mockReturnValue(mockPlots[1].id),
        setData: vi.fn().mockReturnValue(mockPlots[1].id),
      };

      fireEvent.dragStart(draggable, { dataTransfer: mockDataTransfer });
      fireEvent.dragEnter(dropZone, { dataTransfer: mockDataTransfer });
      fireEvent.dragOver(dropZone, { dataTransfer: mockDataTransfer });
      fireEvent.drop(dropZone, { dataTransfer: mockDataTransfer });

      expect(mockDispatch).toHaveBeenCalled();
      expect(updatePlot).toHaveBeenCalledWith({
        plot: {
          id: 2,
          importance: 0,
        },
      });
    });
  });
  test("renders character section and allows drag start", () => {
    renderWithProviders(<Sidebar activeSection={ESections.characters} />, {
      sections: {
        ...store.getState().sections,
        characters: {
          characters: mockCharacters,
          currentCharacter: mockCharacters[0],
        },
        manuscript: {
          chapters: mockChapters,
          currentChapter: undefined,
          currentScene: undefined,
        },
      },
    });
    expect(screen.getByTestId("character-section-title")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  test("renders manuscript section with chapters and toggles scenes", () => {
    renderWithProviders(<Sidebar activeSection={ESections.manuscript} />, {
      sections: {
        ...store.getState().sections,
        characters: {
          characters: mockCharacters,
          currentCharacter: null,
        },
        manuscript: {
          chapters: mockChapters,
          currentChapter: mockChapters[0],
          currentScene: undefined,
        },
      },
    });
    expect(screen.getByText("Structure")).toBeInTheDocument();
    expect(screen.getByText("The Beginning")).toBeInTheDocument();

    const toggleButton = screen.getByTestId("btn-chapter-chap-1");
    fireEvent.click(toggleButton);
    expect(screen.getByText("The Investigation")).toBeInTheDocument();
  });

  test("dispatches setCurrentCharacter on character click", () => {
    renderWithProviders(<Sidebar activeSection={ESections.characters} />, {
      sections: {
        ...store.getState().sections,
        characters: {
          characters: mockCharacters,
          currentCharacter: null,
        },
        manuscript: {
          chapters: mockChapters,
          currentChapter: mockChapters[0],
          currentScene: undefined,
        },
      },
    });
    fireEvent.click(screen.getByText("Jane Smith"));
    expect(mockDispatch).toHaveBeenCalledWith(setCurrentCharacter(mockCharacters[1]));
  });

  test("dispatches updateCharacter on drop", () => {
    renderWithProviders(<Sidebar activeSection={ESections.characters} />, {
      sections: {
        ...store.getState().sections,
        characters: {
          characters: mockCharacters,
          currentCharacter: null,
        },
        manuscript: {
          chapters: mockChapters,
          currentChapter: mockChapters[0],
          currentScene: undefined,
        },
      },
    });

    const dropZone = screen.getByText("Main character").closest("div")!;
    const draggable = screen.getByText("Jane Smith");

    const mockDataTransfer = {
      getData: vi.fn().mockReturnValue(mockCharacters[1].id),
      setData: vi.fn().mockReturnValue(mockCharacters[1].id),
    };

    fireEvent.dragStart(draggable, { dataTransfer: mockDataTransfer });
    fireEvent.dragEnter(dropZone, { dataTransfer: mockDataTransfer });
    fireEvent.dragOver(dropZone, { dataTransfer: mockDataTransfer });
    fireEvent.drop(dropZone, { dataTransfer: mockDataTransfer });

    expect(mockDispatch).toHaveBeenCalled();
    expect(updateCharacter).toHaveBeenCalledWith({
      id: 2,
      info: { importance: PriorityType.MAIN },
    });
  });
});
