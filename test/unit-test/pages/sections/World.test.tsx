import { screen, fireEvent } from "@testing-library/react";
import { vi, test, expect, describe } from "vitest";
import { renderWithProviders } from "../../../utils/renderWithProviders.tsx";
import World from "@/pages/sections/World.tsx";
import { addWorldElement, removeWorldElement, updateWorldElement } from "@/store";
import { mockProjectData, mockWorld, mockWorldElements } from "../../../mocks";
import { ESections } from "@/types/sections.ts";
import { store } from "@/store/config.ts";
import { mockThunkSuccess } from "../../../utils/mockThunkSuccess.ts";
import * as actions from "@/store";

const mockDispatch = vi.fn();
vi.mock("react-redux", async () => {
  const actual = await vi.importActual("react-redux");
  return {
    ...actual,
    useDispatch: () => mockDispatch,
  };
});
mockThunkSuccess(actions, "removeWorldElement", mockWorld);
mockThunkSuccess(actions, "updateWorldElement", mockWorld);
mockThunkSuccess(actions, "addWorldElement", mockWorld);

describe("World component", () => {
  const mockCurrentWorldElement = {
    ...mockWorldElements[0],
    parentId: null,
    childrenIds: [],
  };
  test("calls addWorldElement when 'Add Element' button is clicked", () => {
    renderWithProviders(<World />, {
      project: {
        currentProject: mockProjectData,
        currentSection: ESections.world,
        sections: {
          ...store.getState().project.sections,
          world: {
            world: mockWorld,
            worldElements: {},
            currentWorldElement: null,
          },
        },
      },
    });

    const addButton = screen.getByRole("button", { name: /add element/i });
    fireEvent.click(addButton);

    expect(mockDispatch).toHaveBeenCalled();
    expect(addWorldElement).toHaveBeenCalledWith(0);
  });

  test("calls updateWorldElement when input is changed", () => {
    renderWithProviders(<World />, {
      project: {
        ...store.getState().project,
        sections: {
          ...store.getState().project?.sections,
          world: {
            world: mockWorld,
            worldElements: {
              1: mockCurrentWorldElement,
            },
            currentWorldElement: mockCurrentWorldElement,
          },
        },
      },
    });

    const nameInput = screen.getByDisplayValue("The City");
    fireEvent.change(nameInput, { target: { value: "Updated Name" } });

    expect(mockDispatch).toHaveBeenCalled();
    expect(updateWorldElement).toHaveBeenCalledWith({
      ...mockCurrentWorldElement,
      name: "Updated Name",
    });
  });

  test("calls updateWorldElement when textarea is changed", () => {
    renderWithProviders(<World />, {
      project: {
        ...store.getState().project,
        sections: {
          ...store.getState().project?.sections,
          world: {
            world: mockWorld,
            worldElements: {
              1: mockCurrentWorldElement,
            },
            currentWorldElement: mockCurrentWorldElement,
          },
        },
      },
    });

    const descInput = screen.getByDisplayValue(
      "A sprawling metropolis filled with secrets and shadows.",
    );
    fireEvent.change(descInput, { target: { value: "New description" } });

    expect(mockDispatch).toHaveBeenCalled();
    expect(updateWorldElement).toHaveBeenCalledWith({
      ...mockCurrentWorldElement,
      description: "New description",
    });
  });

  test("calls removeWorldElement when delete button is clicked", () => {
    renderWithProviders(<World />, {
      project: {
        ...store.getState().project,
        sections: {
          ...store.getState().project.sections,
          world: {
            world: mockWorld,
            worldElements: {
              1: mockCurrentWorldElement,
            },
            currentWorldElement: mockCurrentWorldElement,
          },
        },
      },
    });

    const deleteButton = screen.getByTestId(`btn-remove-world-el-1`);
    fireEvent.click(deleteButton);
    expect(mockDispatch).toHaveBeenCalled();
    expect(removeWorldElement).toHaveBeenCalledWith(1);
  });
  test("shows empty state message when there are no world elements", () => {
    renderWithProviders(<World />, {
      project: {
        ...store.getState().project,
        sections: {
          ...store.getState().project.sections,
          world: {
            world: { ...mockWorld, worldElements: [] },
            worldElements: {},
            currentWorldElement: null,
          },
        },
      },
    });

    expect(screen.getByText(/No world elements added yet/i)).toBeInTheDocument();
  });
});
