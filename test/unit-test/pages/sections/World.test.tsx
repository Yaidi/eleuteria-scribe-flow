import { screen, fireEvent } from "@testing-library/react";
import { vi, test, expect, describe } from "vitest";
import { renderWithProviders } from "../../../utils/renderWithProviders.tsx";
import World from "@/pages/sections/World.tsx";
import { addWorldElement, removeWorldElement, updateWorldElement } from "@/store";
import { mockProjectData, mockWorld } from "../../../mocks";
import { ESections } from "@/types/sections.ts";
import { store } from "@/store/config.ts";

const mockDispatch = vi.fn();
vi.mock("react-redux", async () => {
  const actual = await vi.importActual("react-redux");
  return {
    ...actual,
    useDispatch: () => mockDispatch,
  };
});

describe("World component", () => {
  test("calls addWorldElement when 'Add Element' button is clicked", () => {
    renderWithProviders(<World />, {
      projectInfo: {
        currentProject: mockProjectData,
        currentSection: ESections.world,
      },
    });

    const addButton = screen.getByRole("button", { name: /add element/i });
    fireEvent.click(addButton);

    expect(mockDispatch).toHaveBeenCalledWith(addWorldElement({ worldID: 0 }));
  });

  test("calls updateWorldElement when input is changed", () => {
    renderWithProviders(<World />, {
      sections: {
        ...store.getState().sections,
        world: {
          world: mockWorld,
          currentWorldElement: null,
        },
      },
    });

    const nameInput = screen.getByDisplayValue("The City");
    fireEvent.change(nameInput, { target: { value: "Updated Name" } });

    expect(mockDispatch).toHaveBeenCalledWith(
      updateWorldElement({
        name: "Updated Name",
        id: 1,
      }),
    );
  });

  test("calls updateWorldElement when textarea is changed", () => {
    renderWithProviders(<World />, {
      sections: {
        ...store.getState().sections,
        world: {
          world: mockWorld,
          currentWorldElement: null,
        },
      },
    });

    const descInput = screen.getByDisplayValue("Where John works as a detective.");
    fireEvent.change(descInput, { target: { value: "New description" } });

    expect(mockDispatch).toHaveBeenCalledWith(
      updateWorldElement({
        description: "New description",
        id: 2,
      }),
    );
  });

  test("calls removeWorldElement when delete button is clicked", () => {
    renderWithProviders(<World />, {
      sections: {
        ...store.getState().sections,
        world: {
          world: mockWorld,
          currentWorldElement: null,
        },
      },
    });

    const deleteButton = screen.getByTestId(`btn-remove-world-el-1`);
    fireEvent.click(deleteButton);

    expect(mockDispatch).toHaveBeenCalledWith(removeWorldElement(1));
  });
  test("shows empty state message when there are no world elements", () => {
    renderWithProviders(<World />);

    expect(screen.getByText(/No world elements added yet/i)).toBeInTheDocument();
  });
});
