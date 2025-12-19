import { describe, test, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../utils/renderWithProviders.tsx";
import Plot from "@/pages/sections/Plot.tsx";
import * as actions from "@/store";
import { ESections, IPlot } from "@/types/sections.ts";
import { mockPlots, mockProjectData } from "../../../mocks";
import { store } from "@/store/config.ts";
import { mockThunkSuccess } from "../../../utils/mockThunkSuccess.ts";
import { addPlot, removePlot, updatePlot } from "@/store";

const mockDispatch = vi.fn();
vi.mock("react-redux", async () => {
  const actual = await vi.importActual("react-redux");
  return {
    ...actual,
    useDispatch: () => mockDispatch,
  };
});

mockThunkSuccess<IPlot>(actions, "addPlot", mockPlots[0]);
mockThunkSuccess<number>(actions, "removePlot", 1);
mockThunkSuccess<IPlot>(actions, "updatePlot", mockPlots[1]);

describe("Plot Component", () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  test("dispatches addPlot when clicking 'Add Plot'", () => {
    renderWithProviders(<Plot></Plot>);
    expect(screen.getByTestId("no-plots")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /add plot/i }));
    expect(mockDispatch).toHaveBeenCalled();
    expect(addPlot).toHaveBeenCalledWith(0);
  });

  test("dispatches updatePlot title", () => {
    renderWithProviders(<Plot></Plot>, {
      project: {
        currentProject: mockProjectData,
        currentSection: ESections.plots,
        sections: {
          ...store.getState().project.sections,
          plots: {
            plots: mockPlots,
            currentPlot: mockPlots[0],
          },
        },
      },
    });
    const titleInput = screen.getByTestId("input-plot-title-1");
    fireEvent.change(titleInput, { target: { value: "Updated Plot" } });

    expect(mockDispatch).toHaveBeenCalled();
    expect(updatePlot).toHaveBeenCalledWith({ plot: { id: 1, title: "Updated Plot" } });
  });

  test("dispatches updatePlot when editing the description", () => {
    renderWithProviders(<Plot></Plot>, {
      project: {
        currentProject: mockProjectData,
        currentSection: ESections.plots,
        sections: {
          ...store.getState().project.sections,
          plots: {
            plots: mockPlots,
            currentPlot: mockPlots[0],
          },
        },
      },
    });
    const textarea = screen.getByTestId("textarea-plot-description-1");
    fireEvent.change(textarea, { target: { value: "New description" } });

    expect(mockDispatch).toHaveBeenCalled();
    expect(updatePlot).toHaveBeenCalledWith({ plot: { id: 1, description: "New description" } });
  });

  test("dispatches removePlot when clicking trash button", async () => {
    renderWithProviders(<Plot></Plot>, {
      project: {
        currentProject: mockProjectData,
        currentSection: ESections.plots,
        sections: {
          ...store.getState().project.sections,
          plots: {
            plots: mockPlots,
            currentPlot: mockPlots[0],
          },
        },
      },
    });
    await waitFor(() => {
      fireEvent.click(screen.getByTestId("btn-remove-plot-1"));
    });
    expect(mockDispatch).toHaveBeenCalled();
    expect(removePlot).toHaveBeenCalledWith(1);
  });
});
