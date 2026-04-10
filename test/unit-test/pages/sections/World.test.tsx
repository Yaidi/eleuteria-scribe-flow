import { screen, fireEvent } from "@testing-library/react";
import { vi, test, expect, describe } from "vitest";
import { renderWithProviders } from "../../../utils/renderWithProviders.tsx";
import World from "@/pages/sections/World.tsx";
import { removeWorldElement, updateWorldElement } from "@/store";
import { mockWorld, mockWorldElements } from "../../../mocks";
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
