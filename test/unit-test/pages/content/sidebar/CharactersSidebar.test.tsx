import { describe, test, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../../../utils/renderWithProviders.tsx";
import CharactersSidebar from "@/pages/content/sidebar/CharactersSidebar.tsx";
import { store } from "@/store/config.ts";
import { mockProjectData } from "../../../../mocks";
import { ESections } from "@/types/sections.ts";
import { act } from "react";
import { addCharacterFetch } from "@/store";

const projectId = 1;
const dispatchMock = vi.fn();
vi.mock("react-redux", async () => {
  const actual = await vi.importActual<typeof import("react-redux")>("react-redux");
  return {
    ...actual,
    useDispatch: vi.fn(() => dispatchMock),
  };
});
vi.mock("@/store", async () => {
  const actual = await vi.importActual<typeof import("@/store")>("@/store");
  return {
    ...actual,
    addCharacterFetch: vi.fn((projectId) => ({ type: "addCharacterFetch", payload: projectId })),
  };
});

describe("<CharactersSidebar />", () => {
  test("dispatches addCharacterFetch when button is clicked", () => {
    renderWithProviders(<CharactersSidebar />, {
      project: {
        ...store.getState().project,
        currentProject: mockProjectData,
        currentSection: ESections.characters,
      },
    });
    expect(screen.queryByTestId("form-character")).toBeNull();

    const button = screen.getByTestId("btn-add-character");
    act(() => {
      fireEvent.click(button);
    });

    expect(dispatchMock).toHaveBeenCalled();
    expect(addCharacterFetch).toHaveBeenCalledWith(projectId);
  });
});
