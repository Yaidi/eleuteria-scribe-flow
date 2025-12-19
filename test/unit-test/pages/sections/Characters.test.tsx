import { describe, beforeEach, vi, test, expect } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { addCharacterFetch } from "@/store";
import Characters from "@/pages/sections/Characters.tsx";
import { renderWithProviders } from "../../../utils/renderWithProviders.tsx";
import { mockThunkSuccess } from "../../../utils/mockThunkSuccess.ts";
import * as asyncActions from "@/store/sections/characters/slice.ts";
import { ESections, ICharacter } from "@/types/sections.ts";
import { mockCharacters, mockProjectData } from "../../../mocks";
import { store } from "@/store/config.ts";
import { act } from "react";

vi.mock("@/components/FormsCharacters", () => ({
  __esModule: true,
  default: () => <div data-testid="form-character">Mocked Form</div>,
}));

const projectId = 1;
const dispatchMock = vi.fn();

vi.mock("react-redux", async () => {
  const actual = await vi.importActual<typeof import("react-redux")>("react-redux");
  return {
    ...actual,
    useDispatch: vi.fn(() => dispatchMock),
  };
});

mockThunkSuccess<ICharacter>(asyncActions, "addCharacterFetch", mockCharacters[0]);

describe("<Characters />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("no renders when projectId is undefined", () => {
    renderWithProviders(<Characters />);
    expect(screen.queryByText("Characters")).toBeNull();
  });

  test("renders title and empty message when no characters", () => {
    renderWithProviders(<Characters />, {
      project: {
        ...store.getState().project,
        currentProject: mockProjectData,
        currentSection: ESections.characters,
      },
    });

    expect(screen.getByText("Characters")).toBeTruthy();
    expect(screen.getByText(/No characters added yet/i)).toBeTruthy();
  });

  test("renders FormsCharacters when currentCharacter exists", async () => {
    renderWithProviders(<Characters />, {
      project: {
        ...store.getState().project,
        currentProject: mockProjectData,
        currentSection: ESections.characters,
        sections: {
          ...store.getState().project.sections,
          characters: {
            characters: mockCharacters,
            currentCharacter: mockCharacters[0],
          },
        },
      },
    });

    expect(screen.getByTestId("form-character")).toBeTruthy();
  });

  test("dispatches addCharacterFetch when button is clicked", () => {
    renderWithProviders(<Characters />, {
      project: {
        ...store.getState().project,
        currentProject: mockProjectData,
        currentSection: ESections.characters,
      },
    });
    expect(screen.queryByTestId("form-character")).toBeNull();

    const button = screen.getByRole("button", { name: "Add character" });
    act(() => {
      fireEvent.click(button);
    });

    expect(dispatchMock).toHaveBeenCalledWith(expect.anything());
    expect(addCharacterFetch).toHaveBeenCalledWith(projectId);
  });
});
