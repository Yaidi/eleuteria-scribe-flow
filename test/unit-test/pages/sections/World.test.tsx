import { screen, fireEvent } from "@testing-library/react";
import { vi, test, expect, describe } from "vitest";
import { renderWithProviders } from "../../../utils/renderWithProviders.tsx";
import World from "@/pages/sections/World.tsx";
import { addWorldElement, removeWorldElement, updateWorldElement } from "@/store";
import { mockProjectData, mockWorld } from "../../../mocks";
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
  test("calls addWorldElement when 'Add Element' button is clicked", () => {
    renderWithProviders(<World />, {
      projectInfo: {
        currentProject: mockProjectData,
        currentSection: ESections.world,
      },
      sections: {
        ...store.getState().sections,
        world: {
          world: mockWorld,
          worldElements: {},
          currentWorldElement: null,
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
      sections: {
        ...store.getState().sections,
        world: {
          world: mockWorld,
          worldElements: {},
          currentWorldElement: null,
        },
      },
    });

    const nameInput = screen.getByDisplayValue("The City");
    fireEvent.change(nameInput, { target: { value: "Updated Name" } });

    expect(mockDispatch).toHaveBeenCalled();
    expect(updateWorldElement).toHaveBeenCalledWith({
      name: "Updated Name",
      id: 1,
    });
  });

  test("calls updateWorldElement when textarea is changed", () => {
    renderWithProviders(<World />, {
      sections: {
        ...store.getState().sections,
        world: {
          world: mockWorld,
          worldElements: {},
          currentWorldElement: null,
        },
      },
    });

    const descInput = screen.getByDisplayValue("Where John works as a detective.");
    fireEvent.change(descInput, { target: { value: "New description" } });

    expect(mockDispatch).toHaveBeenCalled();
    expect(updateWorldElement).toHaveBeenCalledWith({
      description: "New description",
      id: 2,
    });
  });

  test("calls removeWorldElement when delete button is clicked", () => {
    renderWithProviders(<World />, {
      sections: {
        ...store.getState().sections,
        world: {
          world: mockWorld,
          worldElements: {},
          currentWorldElement: null,
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
      sections: {
        ...store.getState().sections,
        world: {
          world: { ...mockWorld, worldElements: [] },
          worldElements: {},
          currentWorldElement: null,
        },
      },
    });

    expect(screen.getByText(/No world elements added yet/i)).toBeInTheDocument();
  });
});
