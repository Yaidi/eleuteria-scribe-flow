import { describe, test, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import * as storeActions from "@/store";
import { renderWithProviders } from "../../../utils/renderWithProviders.tsx";
import Plot from "@/pages/sections/Plot.tsx";
import { addPlot } from "@/store";
import { ESections, PriorityType } from "@/types/sections.ts";
import { mockPlots, mockProjectData } from "../../../mocks";
import { store } from "@/store/config.ts";

const mockDispatch = vi.fn();
vi.mock("react-redux", async () => {
  const actual = await vi.importActual("react-redux");
  return {
    ...actual,
    useDispatch: () => mockDispatch,
  };
});

describe("Plot Component", () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  test("dispatches addPlot when clicking 'Add Plot'", () => {
    renderWithProviders(<Plot></Plot>);
    expect(screen.getByTestId("no-plots")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /add plot/i }));
    expect(mockDispatch).toHaveBeenCalledWith(
      addPlot({
        id: expect.any(String),
        title: "",
        description: "",
        plotStepsResume: "",
        characters: [],
        projectID: 0,
        plotSteps: [],
        result: "",
        chapterReferences: [],
        importance: PriorityType.MAIN,
      }),
    );
  });

  test("dispatches updatePlot title", () => {
    renderWithProviders(<Plot></Plot>, {
      projectInfo: {
        currentProject: mockProjectData,
        currentSection: ESections.plots,
      },
      sections: {
        ...store.getState().sections,
        plots: {
          plots: mockPlots,
        },
      },
    });
    const titleInput = screen.getByTestId("input-plot-title-plot-1");
    fireEvent.change(titleInput, { target: { value: "Updated Plot" } });

    expect(mockDispatch).toHaveBeenCalledWith(
      storeActions.updatePlot({ id: "plot-1", title: "Updated Plot" }),
    );
  });

  test("dispatches updatePlot when editing the plot steps resume", () => {
    renderWithProviders(<Plot></Plot>, {
      projectInfo: {
        currentProject: mockProjectData,
        currentSection: ESections.plots,
      },
      sections: {
        ...store.getState().sections,
        plots: {
          plots: mockPlots,
        },
      },
    });
    const referenceInput = screen.getByTestId("input-plot-reference-plot-1");
    fireEvent.change(referenceInput, { target: { value: "Chapter 1" } });
    expect(mockDispatch).toHaveBeenCalledWith(
      storeActions.updatePlot({ id: "plot-1", chapterReferences: ["Chapter 1"] }),
    );
  });

  test("dispatches updatePlot when editing the description", () => {
    renderWithProviders(<Plot></Plot>, {
      projectInfo: {
        currentProject: mockProjectData,
        currentSection: ESections.plots,
      },
      sections: {
        ...store.getState().sections,
        plots: {
          plots: mockPlots,
        },
      },
    });
    const textarea = screen.getByTestId("textarea-plot-description-plot-1");
    fireEvent.change(textarea, { target: { value: "New description" } });

    expect(mockDispatch).toHaveBeenCalledWith(
      storeActions.updatePlot({ id: "plot-1", description: "New description" }),
    );
  });

  test("dispatches removePlot when clicking trash button", async () => {
    renderWithProviders(<Plot></Plot>, {
      projectInfo: {
        currentProject: mockProjectData,
        currentSection: ESections.plots,
      },
      sections: {
        ...store.getState().sections,
        plots: {
          plots: mockPlots,
        },
      },
    });
    await waitFor(() => {
      fireEvent.click(screen.getByTestId("btn-remove-plot-plot-1"));
    });
    expect(mockDispatch).toHaveBeenCalledWith(storeActions.removePlot("plot-1"));
  });
});
